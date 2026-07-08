import { App, Button, Card, Drawer, Image, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteFile, fetchFiles } from "../api/files";
import type { FileAsset } from "../types";

function formatBytes(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function FilesPage() {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { files: list, total: t } = await fetchFiles({ page, pageSize: 20 });
      setFiles(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id);
      message.success("文件已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<FileAsset> = [
    { title: "ID", dataIndex: "id", key: "id", width: 90, render: (v: string) => v.slice(-8) },
    {
      title: "归属", key: "owner", width: 160,
      render: (_, record) => (
        <div>
          <Typography.Text>UID {record.ownerUserId}</Typography.Text>
        </div>
      ),
    },
    { title: "业务", dataIndex: "bizType", key: "bizType", width: 120 },
    { title: "存储", dataIndex: "storageProvider", key: "storageProvider", width: 100 },
    { title: "对象键", dataIndex: "objectKey", key: "objectKey", ellipsis: true },
    { title: "MIME", dataIndex: "mimeType", key: "mimeType", width: 140 },
    { title: "大小", dataIndex: "sizeBytes", key: "sizeBytes", width: 110, render: (v) => formatBytes(v) },
    {
      title: "状态", dataIndex: "status", key: "status", width: 100,
      render: (v: number) => <Tag color={v === 1 ? "success" : "error"}>{v === 1 ? "正常" : "拦截"}</Tag>,
    },
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
    {
      title: "操作", key: "actions", width: 120, fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="查看"><Button icon={<Eye size={16} />} onClick={() => setSelectedFile(record)} /></Tooltip>
          <Tooltip title="删除"><Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card>
        <Table<FileAsset>
          rowKey="id" columns={columns} dataSource={files} loading={loading} scroll={{ x: 1200 }}
          pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
        />
      </Card>

      <Drawer title="文件详情" width={520} open={!!selectedFile} onClose={() => setSelectedFile(null)}>
        {selectedFile && (
          <div className="drawer-stack">
            {selectedFile.mimeType?.startsWith("image/") && (
              <Image src={selectedFile.url} alt={selectedFile.objectKey} className="file-preview" />
            )}
            <div className="meta-grid">
              <span>文件 ID</span><strong>{selectedFile.id}</strong>
              <span>归属用户</span><strong>{selectedFile.ownerUserId}</strong>
              <span>业务类型</span><strong>{selectedFile.bizType}</strong>
              <span>对象键</span><strong>{selectedFile.objectKey}</strong>
              <span>MIME</span><strong>{selectedFile.mimeType}</strong>
              <span>大小</span><strong>{formatBytes(selectedFile.sizeBytes)}</strong>
              <span>存储</span><strong>{selectedFile.storageProvider}</strong>
            </div>
            <Space>
              <Button href={selectedFile.url} target="_blank">打开地址</Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}
