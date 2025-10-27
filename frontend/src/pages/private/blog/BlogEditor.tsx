import { useEffect, useMemo, useState, useCallback } from 'react';
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
  Divider,
  Tooltip,
  Modal,
  Badge,
  AutoComplete,
  Tag,
  Alert,
  Tabs,
  Segmented,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  PictureOutlined,
  CodeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  SettingOutlined,
  PreviewOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  CopyOutlined,
  FullscreenOutlined,
  ExitFullscreenOutlined,
  PublicOutlined,
  DraftsOutlined,
  AutoSaveOutlined,
} from '@ant-design/icons';
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

// Markdown syntax helper
const markdownHelp = [
  { syntax: '# Heading 1', description: '一级标题' },
  { syntax: '## Heading 2', description: '二级标题' },
  { syntax: '**Bold**', description: '粗体' },
  { syntax: '*Italic*', description: '斜体' },
  { syntax: '[Link](url)', description: '链接' },
  { syntax: '![Image](url)', description: '图片' },
  { syntax: '`Code`', description: '行内代码' },
  { syntax: '```javascript\nCode\n```', description: '代码块' },
  { syntax: '> Quote', description: '引用' },
  { syntax: '- List item', description: '无序列表' },
  { syntax: '1. List item', description: '有序列表' },
  { syntax: '~~Strikethrough~~', description: '删除线' },
];

const BlogEditor = () => {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm<CreatePostInput & { id?: string }>();
  const [liveSlug, setLiveSlug] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

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

  const onContentChange = (value: string) => {
    setContent(value);

    // Calculate statistics
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;
    setWordCount(words);
    setCharCount(chars);

    // Auto-save logic
    if (autoSave && editing && value) {
      const timer = setTimeout(() => {
        const currentValues = form.getFieldsValue();
        const payload: UpdatePostInput = {
          title: currentValues.title,
          slug: currentValues.slug || slugify(currentValues.title),
          content: value,
          excerpt: currentValues.excerpt,
          isPublic: Boolean(currentValues.isPublic),
          isDraft: Boolean(currentValues.isDraft),
          tags: currentValues.tags || [],
        };
        update.mutate({ id: id!, input: payload }, {
          onSuccess: () => {
            setLastSaved(new Date());
            message.success('Auto-saved', 1);
          }
        });
      }, 2000); // Auto-save after 2 seconds of typing

      return () => clearTimeout(timer);
    }
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textArea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);
    form.setFieldValue('content', newText);

    // Set cursor position
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbarActions = [
    {
      icon: <BoldOutlined />,
      tooltip: '粗体',
      action: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: <ItalicOutlined />,
      tooltip: '斜体',
      action: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: <CodeOutlined />,
      tooltip: '行内代码',
      action: () => insertMarkdown('`', '`', 'code'),
    },
    {
      icon: <LinkOutlined />,
      tooltip: '链接',
      action: () => insertMarkdown('[', '](url)', 'link text'),
    },
    {
      icon: <PictureOutlined />,
      tooltip: '图片',
      action: () => insertMarkdown('![', '](image-url)', 'alt text'),
    },
    {
      icon: <UnorderedListOutlined />,
      tooltip: '无序列表',
      action: () => insertMarkdown('- ', '', 'List item'),
    },
    {
      icon: <OrderedListOutlined />,
      tooltip: '有序列表',
      action: () => insertMarkdown('1. ', '', 'List item'),
    },
    {
      icon: <FileTextOutlined />,
      tooltip: '引用',
      action: () => insertMarkdown('> ', '', 'Quote'),
    },
  ];

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

    if (editing) {
      update.mutate({ id: id!, input: payload }, {
        onSuccess: () => {
          setLastSaved(new Date());
          message.success('保存成功！');
        }
      });
    } else {
      create.mutate(payload, {
        onSuccess: (p: Post) => {
          message.success('创建成功！');
          navigate(`/app/blog/edit/${p.id}`);
        }
      });
    }
  };

  const previewHtml = useMemo(() => miniMarkdown(content), [content]);

  return (
    <div style={{
      maxWidth: fullscreen ? '100vw' : '1400px',
      margin: '0 auto',
      padding: fullscreen ? '0' : '20px',
      background: fullscreen ? '#f5f5f5' : 'transparent',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 12
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {editing ? '✏️ 编辑文章' : '📝 创建新文章'}
            </Title>
            {lastSaved && (
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                最后保存: {lastSaved.toLocaleTimeString()}
              </Text>
            )}
          </div>
          <Space>
            <Button
              icon={fullscreen ? <ExitFullscreenOutlined /> : <FullscreenOutlined />}
              onClick={() => setFullscreen(!fullscreen)}
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {fullscreen ? '退出全屏' : '全屏'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => navigate('/app/blog')}
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              返回列表
            </Button>
          </Space>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        disabled={postQuery.isLoading}
      >
        <Row gutter={[24, 24]}>
          {/* Left Panel - Settings */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  <span>文章设置</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              {/* Basic Info */}
              <Form.Item
                label="标题"
                name="title"
                rules={[{ required: true, message: '请输入标题' }, { min: 3, message: '标题至少3个字符' }]}
              >
                <Input
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="输入文章标题..."
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <span>URL标识</span>
                    <Tooltip title="文章的唯一标识符，用于生成URL">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="slug"
                rules={[{ required: true, message: '请输入URL标识' }, { min: 3, message: 'URL标识至少3个字符' }]}
              >
                <Input
                  placeholder="my-first-post"
                  value={liveSlug}
                  onChange={(e) => setLiveSlug(e.target.value)}
                  addonBefore="/blog/"
                />
              </Form.Item>

              <Form.Item label="标签" name="tags">
                <Select
                  mode="tags"
                  placeholder="添加标签..."
                  tokenSeparators={[',']}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Divider />

              {/* Publication Settings */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>发布设置</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <EyeOutlined />
                    <span>公开</span>
                  </Space>
                  <Form.Item name="isPublic" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <EditOutlined />
                    <span>草稿</span>
                  </Space>
                  <Form.Item name="isDraft" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch defaultChecked />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <SaveOutlined />
                    <span>自动保存</span>
                  </Space>
                  <Switch
                    checked={autoSave}
                    onChange={setAutoSave}
                    disabled={!editing}
                  />
                </div>
              </Space>

              <Divider />

              {/* Excerpt */}
              <Form.Item label="摘要" name="excerpt">
                <TextArea
                  rows={4}
                  maxLength={500}
                  showCount
                  placeholder="可选：文章摘要（500字以内）..."
                />
              </Form.Item>

              {/* Statistics */}
              <Alert
                message={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text type="secondary">文章统计</Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>字数:</span>
                      <Text strong>{wordCount}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>字符:</span>
                      <Text strong>{charCount}</Text>
                    </div>
                  </Space>
                }
                type="info"
                showIcon={false}
                style={{ marginTop: 16 }}
              />

              <Divider />

              {/* Action Buttons */}
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={create.isPending || update.isPending}
                  icon={<SaveOutlined />}
                  size="large"
                  block
                >
                  {editing ? '保存文章' : '创建文章'}
                </Button>

                {!editing && (
                  <Button
                    htmlType="button"
                    onClick={() => form.resetFields()}
                    icon={<ReloadOutlined />}
                    block
                  >
                    重置表单
                  </Button>
                )}
              </Space>
            </Card>
          </Col>

          {/* Right Panel - Editor */}
          <Col xs={24} lg={16}>
            <Card
              style={{ height: 'calc(100vh - 200px)', minHeight: 600 }}
              bodyStyle={{ padding: 0, height: '100%' }}
            >
              {/* Editor Toolbar */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Space>
                  <Segmented
                    options={[
                      { label: '编辑', value: 'edit', icon: <EditOutlined /> },
                      { label: '预览', value: 'preview', icon: <EyeOutlined /> },
                      { label: '分屏', value: 'split', icon: <UnorderedListOutlined /> },
                    ]}
                    value={viewMode}
                    onChange={setViewMode}
                  />
                </Space>

                <Space>
                  {toolbarActions.map((action, index) => (
                    <Tooltip key={index} title={action.tooltip}>
                      <Button
                        type="text"
                        size="small"
                        icon={action.icon}
                        onClick={action.action}
                      />
                    </Tooltip>
                  ))}

                  <Tooltip title="Markdown语法帮助">
                    <Button
                      type="text"
                      size="small"
                      icon={<QuestionCircleOutlined />}
                      onClick={() => {
                        Modal.info({
                          title: 'Markdown 语法参考',
                          width: 600,
                          content: (
                            <div>
                              {markdownHelp.map((item, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                  <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
                                    {item.syntax}
                                  </code>
                                  <Text style={{ marginLeft: 12, color: '#666' }}>
                                    {item.description}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          )
                        });
                      }}
                    />
                  </Tooltip>
                </Space>
              </div>

              {/* Editor Content */}
              <div style={{ display: 'flex', height: 'calc(100% - 60px)' }}>
                {/* Editor */}
                {(viewMode === 'edit' || viewMode === 'split') && (
                  <div style={{
                    flex: viewMode === 'split' ? 1 : 1,
                    borderRight: viewMode === 'split' ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <Form.Item
                      name="content"
                      style={{ margin: 0, height: '100%' }}
                      rules={[{ required: true, message: '请输入文章内容' }, { min: 10, message: '内容至少10个字符' }]}
                    >
                      <TextArea
                        placeholder="# 开始写作&#10;&#10;在这里写下你的想法，支持 Markdown 语法..."
                        onChange={(e) => onContentChange(e.target.value)}
                        style={{
                          border: 'none',
                          resize: 'none',
                          height: '100%',
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          fontSize: 14,
                          lineHeight: 1.6,
                          padding: 16
                        }}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Preview */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div style={{
                    flex: viewMode === 'split' ? 1 : 1,
                    overflow: 'auto',
                    background: 'white'
                  }}>
                    <div
                      className="blog-content"
                      style={{
                        padding: 16,
                        height: '100%',
                        overflow: 'auto'
                      }}
                    >
                      {content ? (
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#999'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <div>开始写作以查看预览</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BlogEditor;
