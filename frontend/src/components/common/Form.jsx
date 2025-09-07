import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Chip,
  Autocomplete,
  Button,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Delete } from '@mui/icons-material';

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const FileUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

const FormField = ({ field, value, onChange, error, ...props }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files) => {
    const file = files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = field.accept?.split(',') || [];
      const maxSize = field.maxSize || 5 * 1024 * 1024; // 5MB default

      if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type.trim()))) {
        onChange(field.name, null, `Invalid file type. Allowed: ${field.accept}`);
        return;
      }

      if (file.size > maxSize) {
        onChange(field.name, null, `File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      onChange(field.name, file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return (
        <TextField
          fullWidth
          type={field.type}
          name={field.name}
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          error={!!error}
          helperText={error || field.helperText}
          required={field.required}
          multiline={field.multiline}
          rows={field.rows}
          inputProps={{
            maxLength: field.maxLength,
            min: field.min,
            max: field.max,
          }}
          {...props}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            label={field.label}
            required={field.required}
          >
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || field.helperText) && (
            <FormHelperText>{error || field.helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'multiselect':
      return (
        <FormControl fullWidth error={!!error}>
          <Autocomplete
            multiple
            options={field.options || []}
            getOptionLabel={(option) => option.label || option}
            value={value || []}
            onChange={(e, newValue) => onChange(field.name, newValue)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  key={index}
                  label={option.label || option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                error={!!error}
                helperText={error || field.helperText}
                required={field.required}
              />
            )}
          />
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              name={field.name}
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
          }
          label={field.label}
        />
      );

    case 'radio':
      return (
        <FormControl error={!!error}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {field.label}
          </Typography>
          <RadioGroup
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          >
            {field.options?.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(error || field.helperText) && (
            <FormHelperText>{error || field.helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControlLabel
          control={
            <Switch
              name={field.name}
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
          }
          label={field.label}
        />
      );

    case 'file':
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {field.label}
          </Typography>
          <FileUploadBox
            className={dragOver ? 'dragover' : ''}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById(`file-${field.name}`).click()}
          >
            <input
              id={`file-${field.name}`}
              type="file"
              accept={field.accept}
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              {value ? value.name : 'Drop files here or click to upload'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {field.accept && `Accepted formats: ${field.accept}`}
              {field.maxSize && ` | Max size: ${field.maxSize / (1024 * 1024)}MB`}
            </Typography>
            {value && (
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(field.name, null);
                  }}
                >
                  Remove
                </Button>
              </Box>
            )}
          </FileUploadBox>
          {(error || field.helperText) && (
            <FormHelperText error={!!error}>
              {error || field.helperText}
            </FormHelperText>
          )}
        </Box>
      );

    default:
      return null;
  }
};

const Form = ({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  children,
  className,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(values);
  };

  const handleFieldChange = (name, value, error = null) => {
    onChange(name, value, error);
  };

  return (
    <StyledForm onSubmit={handleSubmit} className={className} {...props}>
      {fields.map((field, index) => {
        if (field.type === 'divider') {
          return (
            <Box key={index}>
              <Divider sx={{ my: 2 }} />
              {field.label && (
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {field.label}
                </Typography>
              )}
            </Box>
          );
        }

        if (field.type === 'group') {
          return (
            <Box key={index}>
              {field.label && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {field.label}
                </Typography>
              )}
              <Grid container spacing={2}>
                {field.fields?.map((groupField, groupIndex) => (
                  <Grid item xs={12} sm={groupField.width || 6} key={groupIndex}>
                    <FormField
                      field={groupField}
                      value={values[groupField.name]}
                      onChange={handleFieldChange}
                      error={errors[groupField.name]}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        }

        return (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={handleFieldChange}
            error={errors[field.name]}
          />
        );
      })}

      {children}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          size="large"
        >
          {submitLabel}
        </Button>
      </Box>
    </StyledForm>
  );
};

export default Form;
