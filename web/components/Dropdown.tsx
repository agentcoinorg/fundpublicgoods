import { Listbox } from "@headlessui/react";

interface DropdownProps {
  items: string[];
  field: any;
  onChange?: (value: string) => void
}

const Dropdown = (
  { items, field, onChange }: DropdownProps,
) => {
  const listboxProps = {
    ...field,
    ...(onChange && { onChange }) // Spread the onChange prop if it exists
  };
  return (
    <Listbox {...listboxProps}>
      <div className="relative">
        <Listbox.Button className="bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full">
          {field.value}
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-700 text-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-white ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {items.map((item) => (
          <Listbox.Option
            key={item}
            value={item}
            className={`cursor-pointer select-none relative p-2 hover:bg-gray-600`}
          >
            {item}
          </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default Dropdown;
