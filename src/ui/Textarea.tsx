/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './Textarea.css';

import * as React from 'react';

type Props = Readonly<{
  'data-test-id'?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
}>;

export default function TextArea({
  label,
  value,
  onChange,
  placeholder = '',
  'data-test-id': dataTestId,
}: Props): JSX.Element {
  return (
    <div className="Textarea__wrapper">
      <label className="Textarea__label">{label}</label>
      <textarea
        className="Textarea__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-test-id={dataTestId}
      />
    </div>
  );
}
