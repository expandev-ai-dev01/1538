import type { CategorySelectorProps } from './types';

export const CategorySelector = (props: CategorySelectorProps) => {
  const {
    categories,
    selectedCategoryId,
    onSelect,
    placeholder = 'Selecione uma categoria',
    disabled = false,
    allowNull = true,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value === '' ? null : parseInt(value, 10));
  };

  return (
    <select
      value={selectedCategoryId || ''}
      onChange={handleChange}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {allowNull && <option value="">{placeholder}</option>}
      {categories.map((category) => (
        <option key={category.idCategory} value={category.idCategory}>
          {category.name}
        </option>
      ))}
    </select>
  );
};
