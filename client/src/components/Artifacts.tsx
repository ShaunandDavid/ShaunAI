import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Upload,
  Download,
  Delete,
  FilePresent,
  Image,
  Description,
  PictureAsPdf,
  TableChart,
  Code,
  Add,
} from '@mui/icons-material';

interface Artifact {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
}

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    description: '',
    tags: '',
    category: 'general',
  });

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const response = await fetch('/api/artifacts');
      const data = await response.json();
      if (data.success) {
        setArtifacts(data.artifacts);
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', uploadMetadata.description);
    formData.append('tags', uploadMetadata.tags);
    formData.append('category', uploadMetadata.category);

    try {
      const response = await fetch('/api/artifacts/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchArtifacts();
        setUploadOpen(false);
        setSelectedFile(null);
        setUploadMetadata({ description: '', tags: '', category: 'general' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const downloadArtifact = (id: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/artifacts/${id}/download`;
    link.download = filename;
    link.click();
  };

  const deleteArtifact = async (id: string) => {
    try {
      await fetch(`/api/artifacts/${id}`, { method: 'DELETE' });
      fetchArtifacts();
    } catch (error) {
      console.error('Error deleting artifact:', error);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image />;
    if (mimetype === 'application/pdf') return <PictureAsPdf />;
    if (mimetype.includes('spreadsheet') || mimetype.includes('csv')) return <TableChart />;
    if (mimetype.includes('text/') || mimetype.includes('json')) return <Code />;
    return <Description />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'primary';
      case 'recovery': return 'error';
      case 'documentation': return 'info';
      case 'reports': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Artifact Management</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setUploadOpen(true)}
        >
          Upload Artifact
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Artifacts Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Artifacts Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary.main">
                  {artifacts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Artifacts
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="info.main">
                  {formatFileSize(artifacts.reduce((sum, a) => sum + a.size, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Size
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Artifacts List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Artifacts
              </Typography>
              {artifacts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FilePresent sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No artifacts uploaded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload your first artifact to get started
                  </Typography>
                </Box>
              ) : (
                <List>
                  {artifacts.map((artifact) => (
                    <ListItem
                      key={artifact.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getFileIcon(artifact.mimetype)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={artifact.filename}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {artifact.metadata.description || 'No description'}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={artifact.metadata.category}
                                color={getCategoryColor(artifact.metadata.category) as any}
                                size="small"
                              />
                              <Chip
                                label={formatFileSize(artifact.size)}
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                label={new Date(artifact.uploadedAt).toLocaleDateString()}
                                variant="outlined"
                                size="small"
                              />
                              {artifact.metadata.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  variant="outlined"
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => downloadArtifact(artifact.id, artifact.filename)}
                          title="Download"
                        >
                          <Download />
                        </IconButton>
                        <IconButton
                          onClick={() => deleteArtifact(artifact.id)}
                          color="error"
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload New Artifact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 3, textAlign: 'center' }}
              >
                <Box>
                  <Upload sx={{ fontSize: 40, mb: 1, display: 'block' }} />
                  {selectedFile ? selectedFile.name : 'Choose File to Upload'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={uploadMetadata.description}
                onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={uploadMetadata.tags}
                onChange={(e) => setUploadMetadata({ ...uploadMetadata, tags: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Category"
                value={uploadMetadata.category}
                onChange={(e) => setUploadMetadata({ ...uploadMetadata, category: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Artifacts;