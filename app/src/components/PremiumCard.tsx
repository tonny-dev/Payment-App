import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { colors, shadows, borderRadius, spacing } from '../theme';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof borderRadius;
  backgroundColor?: string;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  elevation = 'md',
  padding = 'lg',
  borderRadius: radius = 'xl',
  backgroundColor = colors.surface,
}) => {
  return (
    <View
      style={[
        styles.container,
        shadows[elevation],
        {
          backgroundColor,
          borderRadius: borderRadius[radius],
          padding: spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
});

export default PremiumCard;
