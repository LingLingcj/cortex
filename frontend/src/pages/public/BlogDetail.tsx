import { useParams, Link } from 'react-router-dom';
import { Card, Tag, Typography, Skeleton, Space, Button, Divider, Avatar } from 'antd';
import { CalendarOutlined, UserOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getPostBySlug } from '../../services/posts';
import type { Post } from '../../types/post';
import { miniMarkdown } from '../../utils/markdown';

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery<Post>({
    queryKey: ['post', 'slug', slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (isError || !data) return <Paragraph type="danger">文章不存在或加载失败</Paragraph>;

  const html = miniMarkdown(data.content || '');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 12
        }}
      >
        <div style={{ color: 'white' }}>
          <Link to="/blog">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ color: 'white', marginBottom: 16 }}
            >
              返回博客列表
            </Button>
          </Link>

          <Title level={1} style={{ color: 'white', margin: 0, marginBottom: 16 }}>
            {data.title}
          </Title>

          <Space size="large" wrap>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                {data.author?.name || '匿名作者'}
              </Text>
            </Space>

            <Space>
              <CalendarOutlined />
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                {new Date(data.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Space>

            {data.views && (
              <Space>
                <EyeOutlined />
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {data.views} 次浏览
                </Text>
              </Space>
            )}
          </Space>

          {data.excerpt && (
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16,
                marginTop: 16,
                fontStyle: 'italic'
              }}
            >
              {data.excerpt}
            </Paragraph>
          )}

          {(data.tags || []).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Space wrap>
                {(data.tags || []).map((t) => (
                  <Tag
                    key={t.name}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white'
                    }}
                  >
                    {t.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>

      {/* Footer */}
      <Card
        style={{
          marginTop: 24,
          background: '#f8f9fa',
          border: 'none',
          borderRadius: 12,
          textAlign: 'center'
        }}
      >
        <Space direction="vertical" size="small">
          <Text type="secondary">
            感谢阅读！如果觉得这篇文章对你有帮助，欢迎分享给朋友。
          </Text>
          <Link to="/blog">
            <Button type="primary">阅读更多文章</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default BlogDetail;

