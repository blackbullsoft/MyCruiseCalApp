import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const AccordionList = ({data}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <View>
      {data.map((item, index) => (
        <View key={index}>
          <TouchableOpacity
            onPress={() => toggleExpand(index)}
            style={styles.row}>
            <Text style={styles.cell}>{item.startDate}</Text>
            <Text style={styles.cell}>{item.port || '-'}</Text>
          </TouchableOpacity>

          {expandedIndex === index && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {item.port_description || 'No description available.'}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default AccordionList;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f1f1',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff8e1',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
});
