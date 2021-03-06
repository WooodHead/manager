import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import mapValues from 'lodash/mapValues';
import isEmpty from 'lodash/isEmpty';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import Select from 'linode-components/dist/forms/Select';

export default function DeviceSelect(props) {
  const {
    errors, labelClassName, fieldClassName, configuredDevices, disks, volumes, slot,
  } = props;

  const options = [
    { value: DeviceSelect.EMPTY, label: DeviceSelect.EMPTY },
  ];

  const categories = [['disks', disks], ['volumes', volumes]];

  for (const [type, objects] of categories) {
    if (Object.values(objects).length) {
      options.push({ label: capitalize(type), options: [] });

      Object.values(objects).forEach(function (o) {
        if (!o) {
          return;
        }

        const valueKey = `${type.slice(0, -1)}_id`;
        options[options.length - 1].options.push({
          label: o.label,
          value: JSON.stringify({ [valueKey]: o.id }),
        });
      });
    }
  }

  const configuredDevice = configuredDevices[slot];

  // This linter error is stupid...
  // eslint-disable-next-line react/prop-types
  const onChange = ({ target: { value } }) =>
    props.onChange({ target: { name: slot, value } });

  return (
    <FormGroup className="row" errors={errors} name={slot}>
      <label className={`${labelClassName} col-form-label`}>/dev/{slot}</label>
      <div className={fieldClassName}>
        <Select
          className="input-md"
          onChange={onChange}
          options={options}
          name={slot}
          value={configuredDevice === '{}' ? DeviceSelect.EMPTY : configuredDevice}
        />
        <FormGroupError errors={errors} name={slot} />
      </div>
    </FormGroup>
  );
}

DeviceSelect.EMPTY = '-- None --';

DeviceSelect.format = function (devices) {
  let formatted = devices;
  try {
    formatted = mapValues(devices, d => d === DeviceSelect.EMPTY ? '' : JSON.parse(d));
  } catch (e) {
    // Pass
  }

  return mapValues(formatted, d => isEmpty(d) ? null : d);
};

DeviceSelect.propTypes = {
  errors: PropTypes.object.isRequired,
  labelClassName: PropTypes.string.isRequired,
  fieldClassName: PropTypes.string.isRequired,
  configuredDevices: PropTypes.object.isRequired,
  disks: PropTypes.object.isRequired,
  volumes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  slot: PropTypes.string.isRequired,
};
