import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { useFileUpload } from '../../hooks/useApi';
import { filesAPI } from '../../services/api';

const DropzoneBox = styled(Box)(({ theme, isDragActive, hasError }) => ({
  border: `2px dashed ${
    hasError 
      ? theme.palette.error.main 
      : isDragActive 
        ? theme.palette.primary.main 
        : theme.palette.divider
  }`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive 
    ? theme.palette.action.hover 
    : hasError 
      ? theme.palette.error.light + '10'
      : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const FileItem = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return <Image />;
  if (fileType === 'application/pdf') return <PictureAsPdf />;
  if (fileType.includes('document') || fileType.includes('text')) return <Description />;
  return <InsertDriveFile />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload = ({
  accept = {},
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  uploadType = 'resume',
  onUploadSuccess,
  onUploadError,
  existingFiles = [],
  label = 'Upload Files',
  helperText,
  required = false,
  disabled = false,
}) => {
  const [files, setFiles] = useState(existingFiles);
  const [uploadErrors, setUploadErrors] = useState([]);

  const getUploadFunction = () => {
    switch (uploadType) {
      case 'resume':
        return filesAPI.uploadResume;
      case 'profilePicture':
        return filesAPI.uploadProfilePicture;
      case 'companyLogo':
        return filesAPI.uploadCompanyLogo;
      default:
        return filesAPI.uploadResume;
    }
  };

  const { upload, loading, progress, error } = useFileUpload(
    getUploadFunction(),
    {
      onSuccess: (result) => {
        const newFile = {
          id: result.id,
          name: result.originalName,
          url: result.url,
          size: result.size,
          type: result.mimeType,
        };
        setFiles(prev => [...prev, newFile]);
        onUploadSuccess && onUploadSuccess(newFile);
      },
      onError: (error) => {
        setUploadErrors(prev => [...prev, error]);
        onUploadError && onUploadError(error);
      },
    }
  );

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setUploadErrors([]);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map(e => e.message).join(', ')}`
      );
      setUploadErrors(errors);
    }

    // Upload accepted files
    for (const file of acceptedFiles) {
      if (files.length + acceptedFiles.indexOf(file) < maxFiles) {
        try {
          await upload(file);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
    }
  }, [upload, files.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || loading || files.length >= maxFiles,
  });

  const removeFile = async (fileId) => {
    try {
      await filesAPI.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const hasError = uploadErrors.length > 0 || error;

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {files.length < maxFiles && (
        <DropzoneBox
          {...getRootProps()}
          isDragActive={isDragActive}
          hasError={hasError}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to browse
          </Typography>
          
          <Button variant="outlined" disabled={disabled || loading}>
            Choose Files
          </Button>
          
          {helperText && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {helperText}
            </Typography>
          )}
        </DropzoneBox>
      )}

      {loading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Uploaded Files ({files.length}/{maxFiles})
          </Typography>
          
          {files.map((file) => (
            <FileItem key={file.id} elevation={0}>
              {getFileIcon(file.type)}
              
              <Box sx={{ ml: 2, flex: 1 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              
              <Chip
                label="Uploaded"
                color="success"
                size="small"
                sx={{ mr: 1 }}
              />
              
              <IconButton
                size="small"
                onClick={() => removeFile(file.id)}
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </FileItem>
          ))}
        </Box>
      )}

      {hasError && (
        <Box sx={{ mt: 2 }}>
          {uploadErrors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ))}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
