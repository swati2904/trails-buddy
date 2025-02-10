import { Picker, Item } from '@adobe/react-spectrum';

const DifficultyFilter = ({ selected, onChange }) => (
  <Picker
    label='Filter by Difficulty'
    selectedKey={selected}
    onSelectionChange={onChange}
    width='size-2000'
  >
    <Item key=''>Show All</Item>
    <Item key='hiking'>Easy</Item>
    <Item key='mountain_hiking'>Moderate</Item>
    <Item key='demanding_mountain_hiking'>Hard</Item>
  </Picker>
);

export default DifficultyFilter;
