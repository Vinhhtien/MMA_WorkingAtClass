import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/src/constants/design';
import { useAppTheme } from '@/src/context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface DateTimeSelectorProps {
  value?: number;
  onChange: (value?: number) => void;
}

const createDefaultDate = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInput = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const parseWebDateTime = (dateValue: string, timeValue: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || !/^\d{2}:\d{2}$/.test(timeValue)) {
    return undefined;
  }

  const date = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
};

export default function DateTimeSelector({ value, onChange }: DateTimeSelectorProps) {
  const { isDark, input, border, muted } = useAppTheme();
  const selectedDate = value ? new Date(value) : createDefaultDate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [webDate, setWebDate] = useState(value ? toDateInput(new Date(value)) : '');
  const [webTime, setWebTime] = useState(value ? toTimeInput(new Date(value)) : '');

  useEffect(() => {
    setWebDate(value ? toDateInput(new Date(value)) : '');
    setWebTime(value ? toTimeInput(new Date(value)) : '');
  }, [value]);

  const updatePart = (event: DateTimePickerEvent, next?: Date, mode?: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    if (event.type === 'dismissed' || !next) return;

    const merged = value ? new Date(value) : createDefaultDate();
    if (mode === 'date') {
      merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
    } else {
      merged.setHours(next.getHours(), next.getMinutes(), 0, 0);
    }
    onChange(merged.getTime());
  };

  const updateWeb = (nextDate: string, nextTime: string) => {
    setWebDate(nextDate);
    setWebTime(nextTime);
    onChange(parseWebDateTime(nextDate, nextTime));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: input, borderColor: border }]}>
        <View style={styles.webRow}>
          <View style={styles.webField}>
            <Text style={styles.fieldLabel}>NGÀY (YYYY-MM-DD)</Text>
            <TextInput
              value={webDate}
              onChangeText={(next) => updateWeb(next, webTime)}
              placeholder="2026-06-20"
              placeholderTextColor={muted}
              style={styles.webInput}
              maxLength={10}
            />
          </View>
          <View style={styles.webField}>
            <Text style={styles.fieldLabel}>GIỜ (HH:MM)</Text>
            <TextInput
              value={webTime}
              onChangeText={(next) => updateWeb(webDate, next)}
              placeholder="14:30"
              placeholderTextColor={muted}
              style={styles.webInput}
              maxLength={5}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.hint}>Ví dụ: 2026-06-20 lúc 14:30</Text>
          <Pressable onPress={() => onChange(undefined)} style={styles.clearButton}>
            <Ionicons name="close" size={14} color={palette.danger} />
            <Text style={styles.clearText}>Không đặt hạn</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: input, borderColor: border }]}>
      <View style={styles.nativeRow}>
        <Pressable onPress={() => setShowDatePicker(!showDatePicker)} style={styles.pickerButton}>
          <Ionicons name="calendar-outline" size={18} color={palette.lime} />
          <View>
            <Text style={styles.fieldLabel}>NGÀY</Text>
            <Text style={styles.pickerValue}>
              {value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value) : 'Chọn ngày'}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setShowTimePicker(!showTimePicker)} style={styles.pickerButton}>
          <Ionicons name="time-outline" size={18} color={palette.coral} />
          <View>
            <Text style={styles.fieldLabel}>GIỜ</Text>
            <Text style={styles.pickerValue}>
              {value ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(value) : 'Chọn giờ'}
            </Text>
          </View>
        </Pressable>
      </View>

      {showDatePicker && (
        <View style={styles.pickerPanel}>
          <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
            themeVariant={isDark ? 'dark' : 'light'}
            textColor={isDark ? palette.white : palette.ink}
          accentColor={palette.lime}
          onChange={(event, next) => updatePart(event, next, 'date')}
          />
        </View>
      )}
      {showTimePicker && (
        <View style={styles.pickerPanel}>
          <DateTimePicker
          value={selectedDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour
            themeVariant={isDark ? 'dark' : 'light'}
            textColor={isDark ? palette.white : palette.ink}
          accentColor={palette.lime}
          onChange={(event, next) => updatePart(event, next, 'time')}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {value
            ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(value)
            : 'Chưa đặt ngày và giờ'}
        </Text>
        <Pressable onPress={() => onChange(undefined)} style={styles.clearButton}>
          <Ionicons name="close" size={14} color={palette.danger} />
          <Text style={styles.clearText}>Không đặt hạn</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 16,
    backgroundColor: palette.paper,
    padding: 12,
    gap: 10,
  },
  nativeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerButton: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: palette.ink,
    borderRadius: 12,
    backgroundColor: palette.ink,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: '#A8A39A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pickerValue: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  webRow: {
    flexDirection: 'row',
    gap: 8,
  },
  webField: {
    flex: 1,
    gap: 5,
  },
  webInput: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: palette.ink,
    borderRadius: 11,
    paddingHorizontal: 10,
    backgroundColor: palette.ink,
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  pickerPanel: {
    borderRadius: 14,
    backgroundColor: palette.ink,
    borderWidth: 2,
    borderColor: palette.violet,
    padding: 6,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hint: {
    flex: 1,
    color: palette.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  clearButton: {
    minHeight: 30,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: '#FFE0D9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    color: palette.danger,
    fontSize: 9,
    fontWeight: '900',
  },
});
