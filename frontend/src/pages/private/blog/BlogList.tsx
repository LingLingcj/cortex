import { useMemo } from 'react';
import { Button, Table, Tag, Space, Popconfirm, Typography, App as AntdApp } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPosts, deletePost } from '../../../services/posts';
import type { Post } from '../../../types/post';

const { Title } = Typography;

const BlogList = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { message } = AntdApp.useApp();

  const { data, isLoading } = useQuery<Post[]>({
    queryKey: ['posts', 'all'],
    queryFn: () => listPosts(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: async () => {
      message.success('Deleted');
      await qc.invalidateQueries({ queryKey: ['posts', 'all'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Delete failed');
    },
  });

  const columns = useMemo(
    () => [
      { title: 'Title', dataIndex: 'title', key: 'title' },
      { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 220 },
      {
        title: 'Tags',
        key: 'tags',
        render: (_: any, record: Post) => (
          <Space wrap>
            {(record.tags || []).map((t) => (
              <Tag key={t.name}>{t.name}</Tag>
            ))}
          </Space>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 160,
        render: (_: any, r: Post) => (
          <Space>
            {r.isPublic ? <Tag color="green">Public</Tag> : <Tag>Private</Tag>}
            {r.isDraft ? <Tag color="orange">Draft</Tag> : null}
          </Space>
        ),
      },
      { title: 'Views', dataIndex: 'views', key: 'views', width: 90 },
      {
        title: 'Actions',
        key: 'actions',
        width: 220,
        render: (_: any, r: Post) => (
          <Space>
            <Button size="small" onClick={() => navigate(`/app/blog/edit/${r.id}`)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this post?"
              onConfirm={() => del.mutate(r.id)}
            >
              <Button size="small" danger loading={del.isPending}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [navigate, del.isPending]
  );

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0 }}>Posts</Title>
        <Button type="primary" onClick={() => navigate('/app/blog/new')}>New Post</Button>
      </Space>
      <Table
        rowKey={(r) => r.id}
        loading={isLoading}
        dataSource={data}
        columns={columns as any}
      />
    </div>
  );
};

export default BlogList;
