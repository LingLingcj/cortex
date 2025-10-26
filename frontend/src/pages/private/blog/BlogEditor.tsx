import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Switch,
  Select,
  message,
  Row,
  Col,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, getPostById, updatePost } from '../../../services/posts';
import type { CreatePostInput, Post, UpdatePostInput } from '../../../types/post';
import { miniMarkdown } from '../../../utils/markdown';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// Minimal slugify helper: lower-case, spaces -> '-', remove non-alphanum/-
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}


const initialValues: Partial<CreatePostInput> = {
  isPublic: false,
  isDraft: true,
  tags: [],
};

const BlogEditor = () => {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm<CreatePostInput & { id?: string }>();
  const [liveSlug, setLiveSlug] = useState('');
  const [content, setContent] = useState('');

  const postQuery = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => getPostById(id!),
    enabled: editing,
  });

  useEffect(() => {
    if (postQuery.data) {
      const p = postQuery.data;
      form.setFieldsValue({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        content: p.content,
        isPublic: p.isPublic,
        isDraft: p.isDraft,
        tags: (p.tags || []).map((t) => t.name),
      } as any);
      setLiveSlug(p.slug);
      setContent(p.content || '');
    }
  }, [postQuery.data, form]);

  const create = useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: async (p: Post) => {
      message.success('Created');
      await qc.invalidateQueries({ queryKey: ['posts', 'all'] });
      navigate(`/app/blog/edit/${p.id}`);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Create failed');
    },
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; input: UpdatePostInput }) => updatePost(vars.id, vars.input),
    onSuccess: async () => {
      message.success('Saved');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['posts', 'all'] }),
        qc.invalidateQueries({ queryKey: ['post', id] }),
      ]);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Save failed');
    },
  });

  const onTitleChange = (v: string) => {
    const s = slugify(v);
    setLiveSlug(s);
    // Only auto-fill slug if creating
    if (!editing) form.setFieldValue('slug', s);
  };

  const onFinish = (values: any) => {
    const payload: CreatePostInput = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      content: values.content,
      excerpt: values.excerpt || undefined,
      isPublic: Boolean(values.isPublic),
      isDraft: Boolean(values.isDraft),
      tags: (values.tags || []) as string[],
    };

    if (editing) update.mutate({ id: id!, input: payload });
    else create.mutate(payload);
  };

  const previewHtml = useMemo(() => miniMarkdown(content), [content]);

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0 }}>{editing ? 'Edit Post' : 'New Post'}</Title>
        <Button onClick={() => navigate('/app/blog')}>Back to List</Button>
      </Space>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        disabled={postQuery.isLoading}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Meta">
              <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }, { min: 3 }]}>
                <Input onChange={(e) => onTitleChange(e.target.value)} placeholder="My First Post" />
              </Form.Item>
              <Form.Item label="Slug" name="slug" tooltip="URL id generated from title" rules={[{ required: true }, { min: 3 }]}>
                <Input placeholder="my-first-post" value={liveSlug} />
              </Form.Item>
              <Form.Item label="Tags" name="tags">
                <Select mode="tags" placeholder="Add tags" tokenSeparators={[',']} />
              </Form.Item>
              <Space>
                <Form.Item label="Public" name="isPublic" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch />
                </Form.Item>
                <Form.Item label="Draft" name="isDraft" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch defaultChecked />
                </Form.Item>
              </Space>
              <Form.Item label="Excerpt" name="excerpt">
                <TextArea rows={4} maxLength={500} showCount placeholder="Optional summary (<= 500 chars)" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending}>
                  {editing ? 'Save' : 'Create'}
                </Button>
                {editing ? null : (
                  <Button htmlType="button" onClick={() => form.resetFields()}>Reset</Button>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Content (Markdown)">
              <Form.Item name="content" rules={[{ required: true, message: 'Content is required' }, { min: 10 }]}>
                <TextArea rows={14} onChange={(e) => setContent(e.target.value)} placeholder={"# Hello\nWrite your post in Markdown..."} />
              </Form.Item>
            </Card>
            <Card title="Preview" style={{ marginTop: 16 }}>
              {/* In a real app use a sanitizer lib; our mini parser escapes code blocks */}
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <Paragraph type="secondary">Start typing to see a preview...</Paragraph>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BlogEditor;
