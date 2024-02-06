import Modal, { ModalProps } from "./ModalBase";
import TextField from "./TextField";
import WeightingSlider from "./WeightingSlider";

const WeightingModal = ({ isOpen, title, onClose }: ModalProps) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className='space-y-4'>
        {/* <div className='flex flex-wrap gap-2 items-center'>
          {[
            { name: "Score", active: true },
            { name: "Equal", active: false },
            { name: "Custom", active: false },
          ].map((rankType, i) => (
            <div
              className={clsx(
                "rounded-md p-2 text-xs cursor-pointer flex items-center leading-none space-x-1 border",
                rankType.active
                  ? "bg-indigo-600 text-white border-indigo-800"
                  : "bg-indigo-200 hover:bg-indigo-300 border-indigo-500"
              )}
              key={i}>
              {rankType.active && <CheckCircle weight='bold' />}
              <div>{rankType.name}</div>
            </div>
          ))}
        </div> */}
        <div className='space-y-1'>
          {[{ name: "MetaVenture Capital", weight: 10.3 }].map((project, i) => (
            <div
              className='rounded-lg grid gap-4 grid-cols-12 p-2 items-center bg-indigo-50 border border-indigo-200'
              key={i}>
              <div className='col-span-4 text-[10px] flex items-center space-x-1'>
                <div className='w-6 h-6 rounded-full bg-indigo-300'></div>
                <div>{project.name}</div>
              </div>
              <div className='col-span-6 relative'>
                <WeightingSlider weight={project.weight} />
              </div>
              <div className='col-span-2'>
                <TextField
                  className='!pl-3 !pr-6 !py-1 !border-indigo-100 !shadow-none bg-white !text-[10px]'
                  rightAdornment={<div className='!text-[10px]'>%</div>}
                  value={project.weight}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default WeightingModal;
