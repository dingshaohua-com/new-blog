import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Empty, Pagination, Skeleton, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { match, P } from 'ts-pattern';
import api from '@/api';

const { Paragraph, Text, Title } = Typography;
const skeletonKeys = ['article-skeleton-1', 'article-skeleton-2', 'article-skeleton-3', 'article-skeleton-4', 'article-skeleton-5', 'article-skeleton-6'];

export default function Article() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const { data, error, isLoading } = api.article.useList({ page, pageSize });


  const articles = data?.list ?? [];
  const content = match({ articles, error, isLoading })
    .with({ isLoading: true }, () =>
      skeletonKeys.map((key) => (
        <Card key={key}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      )),
    )
    .with({ error: P.not(P.nullish) }, () => <Alert className="md:col-span-2 xl:col-span-3" type="error" showIcon message="文章加载失败" description="请稍后重试或检查网络连接。" />)
    .with({ articles: [] }, () => (
      <Card className="md:col-span-2 xl:col-span-3">
        <Empty description="暂无文章" />
      </Card>
    ))
    .otherwise(({ articles }) =>
      articles.map((article) => (
        <Card key={article.id} hoverable className="h-full" styles={{ body: { display: 'flex', height: '100%', flexDirection: 'column' } }}>
          <Space size={8} wrap>
            <Tag color="blue">{article.typeName}</Tag>
            <Text type="secondary">
              <CalendarOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD')}
            </Text>
          </Space>

          <Title level={4} ellipsis={{ rows: 2 }} style={{ margin: '16px 0 8px' }}>
            {article.title}
          </Title>
          <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ flex: 1, marginBottom: 16 }}>
            {article.description || '暂无文章简介'}
          </Paragraph>

          <Text type="secondary">
            <FileTextOutlined /> 文章编号：{article.id}
          </Text>
          <Button className="mt-4 self-start" type="link" style={{ paddingInline: 0 }} onClick={() => navigate(`/article/${article.id}`, { state: { article } })}>
            查看详情
          </Button>
        </Card>
      )),
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-10">
      <div>
        <Title level={3} style={{ margin: 0 }}>
          文章列表
        </Title>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{content}</div>

      {!isLoading && !error && (data?.total ?? 0) > 0 && (
        <div className="mt-auto flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={data?.total ?? 0}
            showSizeChanger
            showTotal={(total) => `共 ${total} 篇文章`}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPageSize === pageSize ? nextPage : 1);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      )}
    </div>
  );
}
