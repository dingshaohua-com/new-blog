import { ArrowLeftOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Result, Skeleton, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { match } from 'ts-pattern';
import api from '@/api';
import type { ArticleDetailDTO } from '@/api/generated/models';

const { Paragraph, Text, Title } = Typography;

type DetailState = { status: 'invalid' | 'loading' | 'error' | 'empty' } | { status: 'success'; article: ArticleDetailDTO };

function getDetailState(isValidId: boolean, isLoading: boolean, hasError: boolean, article?: ArticleDetailDTO): DetailState {
  if (!isValidId) return { status: 'invalid' };
  if (isLoading) return { status: 'loading' };
  if (hasError) return { status: 'error' };
  if (!article) return { status: 'empty' };
  return { status: 'success', article };
}

export default function ArticleDetail() {
  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const isValidId = Number.isInteger(id) && id > 0;
  const { data, error, isLoading } = api.article.useGet(id, { swr: { enabled: isValidId } });
  const detailState = getDetailState(isValidId, isLoading, Boolean(error), data);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/article')}>
          返回文章列表
        </Button>

        {match(detailState)
          .with({ status: 'invalid' }, () => (
            <Card className="mt-4">
              <Result
                status="warning"
                title="文章地址无效"
                subTitle="请检查文章 ID，或返回文章列表重新选择。"
                extra={
                  <Button type="primary" onClick={() => navigate('/article')}>
                    返回文章列表
                  </Button>
                }
              />
            </Card>
          ))
          .with({ status: 'loading' }, () => (
            <Card className="mt-4" styles={{ body: { padding: 'clamp(24px, 5vw, 56px)' } }}>
              <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 8 }} />
            </Card>
          ))
          .with({ status: 'error' }, () => <Alert className="mt-4" type="error" showIcon message="文章加载失败" description="请稍后重试或返回文章列表。" />)
          .with({ status: 'empty' }, () => (
            <Card className="mt-4">
              <Result status="404" title="文章不存在" subTitle="该文章可能已被删除。" />
            </Card>
          ))
          .with({ status: 'success' }, ({ article }) => (
            <Card className="mt-4" styles={{ body: { padding: 'clamp(24px, 5vw, 56px)' } }}>
              <Space size={8} wrap>
                <Tag color="blue">{article.typeName}</Tag>
                <Text type="secondary">
                  <CalendarOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}
                </Text>
                <Text type="secondary">
                  <FileTextOutlined /> 编号 {article.id}
                </Text>
              </Space>

              <Title style={{ marginTop: 20 }}>{article.title}</Title>

              <div className="my-8 border-t border-slate-200 dark:border-slate-800" />

              {article.description && (
                <Paragraph type="secondary" style={{ fontSize: 16 }}>
                  {article.description}
                </Paragraph>
              )}
              <Paragraph style={{ fontSize: 16, lineHeight: 2, whiteSpace: 'pre-wrap' }}>{article.content || '暂无文章内容'}</Paragraph>
            </Card>
          ))
          .exhaustive()}
      </div>
    </div>
  );
}
