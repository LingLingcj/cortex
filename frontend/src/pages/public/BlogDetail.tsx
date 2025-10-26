import { useParams, Link } from 'react-router-dom';
import { Card, Tag, Typography, Skeleton, Space, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getPostBySlug } from '../../services/posts';
import type { Post } from '../../types/post';
import { miniMarkdown } from '../../utils/markdown';

const { Title, Paragraph } = Typography;

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
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{data.title}</Title>
        <Link to="/blog"><Button>Back</Button></Link>
      </Space>

      <Space size="middle" style={{ marginBottom: 12 }}>
        <span>{new Date(data.createdAt).toLocaleString()}</span>
        {data.author?.name ? <span>· {data.author.name}</span> : null}
        <Space wrap>
          {(data.tags || []).map((t) => (
            <Tag key={t.name}>{t.name}</Tag>
          ))}
        </Space>
      </Space>

      <Card>
        {/* For production, ensure to sanitize HTML or use a markdown renderer with sanitization. */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Card>
    </div>
  );
};

export default BlogDetail;

