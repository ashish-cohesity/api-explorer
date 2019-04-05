const React = require('react');
const PropTypes = require('prop-types');
const Form = require('react-jsonschema-form').default;
const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;
const DateTimeWidget = require('react-jsonschema-form/lib/components/widgets/DateTimeWidget')
  .default;

const DescriptionField = require('./form-components/DescriptionField');
const createBaseInput = require('./form-components/BaseInput');
const createSelectWidget = require('./form-components/SelectWidget');
const createArrayField = require('./form-components/ArrayField');
const createSchemaField = require('./form-components/SchemaField');
const createTextareaWidget = require('./form-components/TextareaWidget');
const createFileWidget = require('./form-components/FileWidget');
const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

const arrayKeys = [];

const _set = (obj, path, value) => {
  if (Object(obj) !== obj) return obj;
  const p = path.split(".");
  p.slice(0,-1).reduce((a, c, i) =>
      Object(a[c]) === a[c]
        ? a[c]
        : a[c] = Math.abs(p[i+1])>>0 === +p[i+1]
        ? []
        : {},
    obj)[p.pop()] = value;
  return obj;
};

function updateSchema(schema) {
  arrayKeys.forEach(key => {
    _set(schema, `${key}.properties`, {});
  });
  return schema;
}

function findObjectKeysWithoutPropertyValue(target, keyName) {
  if (typeof target !== 'object') return;

  for (const key in target) {
    if (
      key === 'type' &&
      target[key] === 'object' &&
      !target.properties &&
      !target.additionalProperties
    )
      arrayKeys.push(keyName);
    findObjectKeysWithoutPropertyValue(target[key], keyName ? `${keyName}.${key}` : key);
  }
}

function Params({
  oas,
  operation,
  formData,
  onChange,
  onSubmit,
  BaseInput,
  SelectWidget,
  ArrayField,
  SchemaField,
  TextareaWidget,
  FileWidget,
}) {
  const jsonSchema = parametersToJsonSchema(operation, oas);

  return (
    jsonSchema &&
    jsonSchema.map(schema => {
      arrayKeys.splice(0, arrayKeys.length);
      findObjectKeysWithoutPropertyValue(schema);
      updateSchema(schema);
      return [
        <div className="param-type-header" key={`${schema.type}-header`}>
          <h3>{schema.label}</h3>
          <div className="param-header-border" />
        </div>,
        <Form
          key={`${schema.type}-form`}
          id={`form-${operation.operationId}`}
          idPrefix={operation.operationId}
          schema={schema.schema}
          widgets={{
            int64: UpDownWidget,
            int32: UpDownWidget,
            double: UpDownWidget,
            float: UpDownWidget,
            binary: FileWidget,
            byte: TextWidget,
            string: TextWidget,
            uuid: TextWidget,
            duration: TextWidget,
            dateTime: DateTimeWidget,
            integer: UpDownWidget,
            json: TextareaWidget,
            BaseInput,
            SelectWidget,
          }}
          onSubmit={onSubmit}
          formData={formData[schema.type]}
          onChange={form => {
            return onChange({ [schema.type]: form.formData });
          }}
          fields={{
            DescriptionField,
            ArrayField,
            SchemaField,
          }}
        >
          <button type="submit" style={{ display: 'none' }} />
        </Form>,
      ];
    })
  );
}

Params.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  BaseInput: PropTypes.func.isRequired,
  SelectWidget: PropTypes.func.isRequired,
  ArrayField: PropTypes.func.isRequired,
  SchemaField: PropTypes.func.isRequired,
  TextareaWidget: PropTypes.func.isRequired,
  FileWidget: PropTypes.func.isRequired,
};

function createParams(oas) {
  const BaseInput = createBaseInput(oas);
  const SelectWidget = createSelectWidget(oas);
  const ArrayField = createArrayField(oas);
  const SchemaField = createSchemaField();
  const TextareaWidget = createTextareaWidget(oas);
  const FileWidget = createFileWidget(oas);

  return props => {
    return (
      <Params
        {...props}
        BaseInput={BaseInput}
        SelectWidget={SelectWidget}
        ArrayField={ArrayField}
        SchemaField={SchemaField}
        TextareaWidget={TextareaWidget}
        FileWidget={FileWidget}
      />
    );
  };
}

module.exports = createParams;
