import { Listbox } from "@headlessui/react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

interface DropdownProps {
  items: string[];
  field: any;
  onChange?: (value: string) => void;
}

const Dropdown = ({ items, field, onChange }: DropdownProps) => {
  const listboxProps = {
    ...field,
    ...(onChange && { onChange }), // Spread the onChange prop if it exists
  };
  return (
    <Listbox {...listboxProps}>
      <div className='relative'>
        <Listbox.Button className='text-sm leading-none flex space-x-1 hover:text-indigo-600 p-1.5 hover:bg-indigo-100 transition-colors duration-500 ease-in-out rounded-md'>
          <div>{field.value}</div>
          <CaretDown weight='bold' />
        </Listbox.Button>
        <Listbox.Options className='absolute z-10 mt-1 w-full bg-white shadow-lg shadow-primary-shadow/20 max-h-60 rounded-lg p-2 ring-1 ring-white ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'>
          {items.map((item) => (
            <Listbox.Option
              key={item}
              value={item}
              className={`cursor-pointer select-none relative p-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600`}>
              {item}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default Dropdown;
