import React from 'react';
import { Box, Label } from '@adminjs/design-system';

const ImageShow = (props) => {
  const { record, property } = props;
  const value = record.params[property.path] || '';

  if (!value || value.length === 0) {
    return <Label>No hay imagen</Label>;
  }

  return (
    <Box>
      <Label>{property.label}</Label>
      <img
        src={value}
        alt={property.label}
        style={{
          maxWidth: '100%',
          maxHeight: '300px',
          objectFit: 'contain',
          marginTop: '8px',
          borderRadius: '4px',
        }}
      />
    </Box>
  );
};

export default ImageShow;