import { Typography, List, Skeleton, Tag, Card, Space, Empty, Button } from 'antd';
import { CalendarOutlined, UserOutlined, EyeOutlined, ReadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listPosts } from '../../services/posts';
import type { Post } from '../../types/post';

const { Title, Paragraph } = Typography;

const Blog = () => {
  const { data, isLoading, isError } = useQuery<Post[]>({
    queryKey: ['posts', 'public'],
    queryFn: () => listPosts({ public: true }),
  });

  if (isLoading) return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  );

  if (isError) return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      <Paragraph type="danger">加载文章失败</Paragraph>
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无公开文章"
          >
            <Link to="/">
              <Button type="primary">返回首页</Button>
            </Link>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ marginBottom: '16px' }}>
          📝 博客文章
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666' }}>
          分享技术见解，记录学习历程
        </Paragraph>
      </div>

      {/* Blog List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {data.map((item) => (
          <Card
            key={item.id}
            hoverable
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
            cover={
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px'
              }}>
                <ReadOutlined />
              </div>
            }
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Title */}
              <Title level={4} style={{ marginBottom: '8px', marginTop: 0 }}>
                <Link
                  to={`/blog/${item.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {item.title}
                </Link>
              </Title>

              {/* Meta info */}
              <Space size="middle" style={{ marginBottom: '12px' }}>
                <Space size="small">
                  <CalendarOutlined style={{ color: '#666' }} />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </Space>

                {item.author?.name && (
                  <Space size="small">
                    <UserOutlined style={{ color: '#666' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {item.author.name}
                    </span>
                  </Space>
                )}

                {item.views && (
                  <Space size="small">
                    <EyeOutlined style={{ color: '#666' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {item.views}
                    </span>
                  </Space>
                )}
              </Space>

              {/* Excerpt */}
              <Paragraph
                ellipsis={{ rows: 3 }}
                style={{
                  flex: 1,
                  marginBottom: '16px',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: 1.6
                }}
              >
                {item.excerpt || '暂无摘要'}
              </Paragraph>

              {/* Tags and Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space wrap>
                  {(item.tags || []).slice(0, 3).map((t) => (
                    <Tag key={t.name} color="blue" style={{ fontSize: '12px' }}>
                      {t.name}
                    </Tag>
                  ))}
                  {(item.tags || []).length > 3 && (
                    <Tag style={{ fontSize: '12px' }}>
                      +{(item.tags || []).length - 3}
                    </Tag>
                  )}
                </Space>

                <Link to={`/blog/${item.slug}`}>
                  <Button type="primary" size="small">
                    阅读全文
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
        <Paragraph type="secondary">
          共找到 {data.length} 篇文章
        </Paragraph>
      </div>
    </div>
  );
};

export default Blog;
