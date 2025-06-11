import { DatePicker, Space } from 'antd';
import React from 'react';


const { RangePicker } = DatePicker;


const DateRangeFilter = ({ onChange, style }) => {
  return (
    <Space direction="vertical" size={12} style={style}>
      <RangePicker
        onChange={onChange}
        allowEmpty={[true, true]}
        style={{ width: '100%' }}
      />
    </Space>
  );
};


export default DateRangeFilter;
