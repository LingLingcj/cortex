import { Typography, List, Skeleton, Tag } from 'antd';
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

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (isError) return <Paragraph type="danger">加载文章失败</Paragraph>;

  return (
    <div>
      <Title level={2}>Blog</Title>
      <List
        itemLayout="vertical"
        dataSource={data}
        renderItem={(item) => (
          <List.Item key={item.id} extra={<Tag color="blue">Public</Tag>}>
            <List.Item.Meta
              title={<Link to={`/blog/${item.slug}`}>{item.title}</Link>}
              description={
                <>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.author?.name ? <span> · {item.author.name}</span> : null}
                </>
              }
            />
            <Paragraph ellipsis={{ rows: 3 }}>{item.excerpt || 'No excerpt.'}</Paragraph>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Blog;
