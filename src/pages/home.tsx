import { Button, Card, DatePicker, Form, Grid, Input, Modal, Pagination, Popconfirm, Select, Space, Table, type TableProps, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useTableScrolly } from '@/components/use-table-scrolly';

type WorkOrder = {
  id: number;
  title: string;
  owner: string;
  priority: 'P0' | 'P1' | 'P2';
  status: '处理中' | '待跟进' | '已关闭';
  createdAt: string;
};

const data: WorkOrder[] = Array.from({ length: 57 }, (_, index) => {
  const priorities: WorkOrder['priority'][] = ['P0', 'P1', 'P2'];
  const statuses: WorkOrder['status'][] = ['处理中', '待跟进', '已关闭'];
  const id = index + 1;

  return {
    id,
    title: `测试工单 ${String(id).padStart(3, '0')}`,
    owner: ['张三', '李四', '王五', '赵六'][index % 4],
    priority: priorities[index % priorities.length],
    status: statuses[index % statuses.length],
    createdAt: `2026-05-${String((index % 21) + 1).padStart(2, '0')}`,
  };
});

export default function Home() {
  const { ref, scrollY } = useTableScrolly();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.md);
  const [queryForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [page, pageSize]);

  const columns: TableProps<WorkOrder>['columns'] = [
    {
      title: '工单编号',
      dataIndex: 'id',
      width: isDesktop ? 100 : 110,
      render: (id) => `#${String(id).padStart(4, '0')}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      width: 120,
      responsive: ['md'],
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 120,
      responsive: ['md'],
      render: (priority) => {
        const color = priority === 'P0' ? 'red' : priority === 'P1' ? 'orange' : 'blue';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      responsive: ['md'],
      render: (status) => <Tag color={status === '已关闭' ? 'default' : 'processing'}>{status}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 140,
      responsive: ['md'],
    },
    {
      title: '操作',
      key: 'actions',
      fixed: isDesktop ? 'right' : undefined,
      width: isDesktop ? 140 : 112,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => setEditingOrder(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除这条工单？" description="这里只做弹窗演示，不会真的删除数据。" okText="确认" cancelText="取消">
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Card size="small" styles={{ body: { paddingTop: 30, paddingBottom: 30 } }}>
        <Form form={queryForm} onFinish={() => setPage(1)}>
          <div className="grid gap-y-3 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
              <span className="text-sm font-medium text-foreground">关键词</span>
              <Form.Item name="keyword" noStyle>
                <Input allowClear placeholder="标题 / 工单编号" />
              </Form.Item>
            </div>
            <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
              <span className="text-sm font-medium text-foreground">状态</span>
              <Form.Item name="status" noStyle>
                <Select
                  allowClear
                  placeholder="全部状态"
                  options={[
                    { label: '处理中', value: '处理中' },
                    { label: '待跟进', value: '待跟进' },
                    { label: '已关闭', value: '已关闭' },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
              <span className="text-sm font-medium text-foreground">优先级</span>
              <Form.Item name="priority" noStyle>
                <Select
                  allowClear
                  placeholder="全部优先级"
                  options={[
                    { label: 'P0', value: 'P0' },
                    { label: 'P1', value: 'P1' },
                    { label: 'P2', value: 'P2' },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
              <span className="text-sm font-medium text-foreground">创建时间</span>
              <Form.Item name="createdAt" noStyle>
                <DatePicker.RangePicker className="w-full" />
              </Form.Item>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              onClick={() => {
                queryForm.resetFields();
                setPage(1);
              }}
            >
              重置
            </Button>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="md:min-h-0 md:flex-1" styles={{ body: { height: isDesktop ? '100%' : undefined, padding: 16, display: 'flex', flexDirection: 'column', minHeight: isDesktop ? 0 : undefined } }}>
        <div ref={ref} className={isDesktop ? 'min-h-0 flex-1 overflow-hidden' : undefined}>
          <Table<WorkOrder> rowKey="id" columns={columns} dataSource={pageData} pagination={false} scroll={isDesktop ? { x: 900, y: scrollY } : undefined} size="middle" />
        </div>

        <div className="mt-3 flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={data.length}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      </Card>

      <Modal title="编辑工单" open={!!editingOrder} okText="保存" cancelText="取消" onOk={() => setEditingOrder(null)} onCancel={() => setEditingOrder(null)}>
        {editingOrder && (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">工单编号：</span>#{String(editingOrder.id).padStart(4, '0')}
            </div>
            <div>
              <span className="text-muted-foreground">标题：</span>
              {editingOrder.title}
            </div>
            <div>
              <span className="text-muted-foreground">负责人：</span>
              {editingOrder.owner}
            </div>
            <div>
              <span className="text-muted-foreground">状态：</span>
              {editingOrder.status}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
