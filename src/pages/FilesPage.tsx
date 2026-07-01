import { Button, Card, Drawer, Image, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye } from "lucide-react";
import { useState } from "react";
import { files } from "../data/mock";
import type { FileAsset } from "../types";

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function FilesPage() {
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);

  const columns: ColumnsType<FileAsset> = [
    { title: "ID", dataIndex: "id", key: "id", width: 90 },
    {
      title: "归属",
      key: "owner",
      width: 160,
      render: (_, record) => (
        <div>
          <Typography.Text>{record.ownerName}</Typography.Text>
          <div className="muted-text">UID {record.ownerUserId}</div>
        </div>
      ),
    },
    { title: "业务", dataIndex: "bizType", key: "bizType", width: 120 },
    { title: "存储", dataIndex: "storageProvider", key: "storageProvider", width: 100 },
    { title: "对象键", dataIndex: "objectKey", key: "objectKey", ellipsis: true },
    { title: "MIME", dataIndex: "mimeType", key: "mimeType", width: 140 },
    {
      title: "大小",
      dataIndex: "sizeBytes",
      key: "sizeBytes",
      width: 110,
      render: (value) => formatBytes(value),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => <Tag color={value === "normal" ? "success" : "error"}>{value === "normal" ? "正常" : "拦截"}</Tag>,
    },
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
    {
      title: "操作",
      key: "actions",
      width: 88,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="预览">
          <Button icon={<Eye size={16} />} onClick={() => setSelectedFile(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card>
        <Table<FileAsset>
          rowKey="id"
          columns={columns}
          dataSource={files}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        title="文件详情"
        width={520}
        open={Boolean(selectedFile)}
        onClose={() => setSelectedFile(null)}
      >
        {selectedFile && (
          <div className="drawer-stack">
            {selectedFile.mimeType.startsWith("image/") && (
              <Image src={selectedFile.url} alt={selectedFile.objectKey} className="file-preview" />
            )}
            <div className="meta-grid">
              <span>文件 ID</span>
              <strong>{selectedFile.id}</strong>
              <span>归属用户</span>
              <strong>
                {selectedFile.ownerName} / {selectedFile.ownerUserId}
              </strong>
              <span>业务类型</span>
              <strong>{selectedFile.bizType}</strong>
              <span>对象键</span>
              <strong>{selectedFile.objectKey}</strong>
              <span>MIME</span>
              <strong>{selectedFile.mimeType}</strong>
              <span>大小</span>
              <strong>{formatBytes(selectedFile.sizeBytes)}</strong>
            </div>
            <Space>
              <Button href={selectedFile.url} target="_blank">
                打开地址
              </Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}
