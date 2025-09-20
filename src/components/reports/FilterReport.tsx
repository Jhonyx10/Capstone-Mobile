import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import useCategories from "../../hooks/useCategory";
import { Category } from "../../types/CategoryType";


const FilterReport = () => {
    const [value, setValue] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useCategories();

    return (
        <View>
             <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="category_name"
                valueField="id"
                placeholder="Select Category"
                value={value}
                onChange={(item: Category) => setValue(item.id.toString())}
            />
             {isLoading && <Text>Loading categories...</Text>}
        </View>
    )
}
export default FilterReport

const styles = StyleSheet.create({
     dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
})