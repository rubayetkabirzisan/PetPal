import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "../theme/theme";

interface SelectFieldProps {
  label: string;
  options: Array<{ id: string; name: string; icon?: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string | null;
  required?: boolean;
  layout?: "horizontal" | "grid";
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  error,
  required,
  layout = "horizontal",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.optionsContainer, layout === "grid" ? styles.gridLayout : styles.horizontalLayout]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              layout === "grid" ? styles.gridOption : styles.horizontalOption,
              selectedValue === option.name && styles.optionActive,
            ]}
            onPress={() => onSelect(option.name)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <Ionicons
                name={option.icon as any}
                size={16}
                color={selectedValue === option.name ? "white" : colors.primary}
                style={styles.optionIcon}
              />
            )}
            <Text style={[styles.optionText, selectedValue === option.name && styles.optionTextActive]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  horizontalLayout: {
    flexDirection: "row",
  },
  gridLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  option: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalOption: {
    flex: 1,
  },
  gridOption: {
    minWidth: "30%",
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    marginRight: spacing.xs,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  optionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
});
