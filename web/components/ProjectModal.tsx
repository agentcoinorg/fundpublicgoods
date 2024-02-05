import {
  ArrowSquareOut,
  GithubLogo,
  GlobeSimple,
  TwitterLogo,
} from "@phosphor-icons/react/dist/ssr";
import Modal, { ModalProps } from "./ModalBase";
import Score from "./Score";

const ProjectModal = ({ isOpen, title, onClose }: ModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      panelStyles={{ maxWidth: "max-w-screen-md" }}>
      <div className='grid gap-4 grid-cols-12'>
        <div className='space-y-4 col-span-12 md:col-span-5'>
          <div className='bg-indigo-50 p-3 rounded-xl space-y-4'>
            <div className='text-[10px]'>
              MetaVenture Capital project description goes here. Al contrario
              del pensamiento popular, el texto de Lorem Ipsum no es simplemente
              texto aleatorio. Tiene sus raices en una pieza sica de la
              literatura del Latin, que data del año 45 antes de Cristo.
            </div>
            <div className='space-y-2'>
              <a
                href='#'
                target='_blank'
                rel='noredirect'
                className='border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1'>
                <GlobeSimple weight='bold' size={16} />
                <div className='w-full text-[10px] leading-none'>
                  https://projecturl.com
                </div>
                <ArrowSquareOut weight='bold' size={16} />
              </a>
              <a
                href='#'
                target='_blank'
                rel='noredirect'
                className='border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1'>
                <GithubLogo weight='bold' size={16} />
                <div className='w-full text-[10px] leading-none'>
                  @project_github
                </div>
                <ArrowSquareOut weight='bold' size={16} />
              </a>
              <a
                href='#'
                target='_blank'
                rel='noredirect'
                className='border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1'>
                <TwitterLogo weight='bold' size={16} />
                <div className='w-full text-[10px] leading-none'>
                  @project_github
                </div>
                <ArrowSquareOut weight='bold' size={16} />
              </a>
            </div>
          </div>
          <div className='bg-indigo-50 p-3 rounded-xl space-y-4'>
            <div className='flex justify-between items-center pb-4 border-b border-indigo-300'>
              <div className='text-md'>Score</div>
              <div className='px-1 border border-indigo-300 rounded'>
                <Score rank={0.93} icon={false} />
              </div>
            </div>
            <div className='text-[10px]'>
              Score reasoning goes here. Al contrario del penmiento popular, el
              texto de Lorem Ipsum no es simplemente texto aleatorio. Tiene sus
              raices en una pieza sica de la literatura del Latin, que data del
              año 45 antes de Cristo, haciendo que este adquiera mas de 2000
              años de antiguedad. Richard McClintock, un profesor de Latin.
            </div>
            <div className='grid gap-2 grid-cols-3 items-center'>
              {[
                { category: "Funding Needs", value: 7.5 },
                { category: "Impact", value: 9 },
                { category: "Relevance", value: 8 },
              ].map((item, i) => (
                <div
                  className='rounded-md p-1.5 border border-indigo-200 leading-none space-y-1.5 w-full'
                  key={i}>
                  <div className='text-[8px] text-indigo-400 uppercase tracking-loose leading-none'>
                    {item.category}
                  </div>
                  <div className='text-md'>
                    {item.value}
                    <span className='text-xs text-indigo-400 leading-none'>
                      /10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='space-y-4 col-span-12 md:col-span-7'>
          <div className='text-[10px]'>
            Project report goes here. Al contrario del pensamiento popular, el
            texto de Lorem Ipsum no es simplemente texto aleatorio. Tiene sus
            raices en una pieza sica de la literatura del Latin, que data del
            año 45 antes de Cristo.
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
