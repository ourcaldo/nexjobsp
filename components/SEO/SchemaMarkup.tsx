import React from 'react';

interface SchemaMarkupProps {
  schema: object | object[];
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  const schemaArray = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemaArray.map((schemaObj, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaObj, null, 0)
          }}
        />
      ))}
    </>
  );
};

export default SchemaMarkup;