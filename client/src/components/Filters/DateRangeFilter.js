import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { CalendarOutlined } from '@ant-design/icons';


// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);


const { RangePicker } = DatePicker;


const DateRangeFilter = ({ 
  value, 
  onChange, 
  style,
  placeholder = ["Start date", "End date"]
}) => {
  // Convert date strings to dayjs objects for the picker
  const normalizedValue = value?.map(date => date && dayjs(date));


  // Handle date selection changes
  const handleChange = (dates, dateStrings) => {
    if (!dates || dates.some(date => !date)) {
      onChange(null);
      return;
    }
    // Convert to native Date objects at start/end of day
    onChange([
      dates[0].startOf('day').toDate(),
      dates[1].endOf('day').toDate()
    ]);
  };


  // Preset time ranges
  const rangePresets = [
    { label: 'Today', value: [dayjs(), dayjs()] },
    { label: 'Yesterday', value: [dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd')] },
    { label: 'Last 7 Days', value: [dayjs().subtract(7, 'd'), dayjs()] },
    { label: 'Last 30 Days', value: [dayjs().subtract(30, 'd'), dayjs()] },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
  ];


  return (
    <RangePicker
      value={normalizedValue}
      onChange={handleChange}
      presets={rangePresets}
      allowEmpty={[true, true]}
      style={{ width: '100%', ...style }}
      placeholder={placeholder}
      suffixIcon={<CalendarOutlined />}
      format="MMM D, YYYY"
      disabledDate={(current) => current && current > dayjs().endOf('day')} // Can't select future dates
      ranges={{
        'All Time': [dayjs('1970-01-01'), dayjs()], // Custom preset
      }}
    />
  );
};


export default DateRangeFilter;
