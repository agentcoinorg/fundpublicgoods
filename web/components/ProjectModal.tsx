import {
  ArrowSquareOut,
  GlobeSimple,
  TwitterLogo,
} from "@phosphor-icons/react/dist/ssr";
import Modal, { ModalProps } from "./ModalBase";
import Score from "./Score";
import { StrategyInformation } from "./StrategyTable";
import ReactMarkdown from "react-markdown";

export type ProjectModalProps = ModalProps & {
  strategy?: StrategyInformation;
};

const ProjectModal = ({
  isOpen,
  title,
  onClose,
  strategy,
}: ProjectModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      panelStyles={{ maxWidth: "max-w-screen-md" }}
    >
      {strategy && (
        <div className="grid gap-4 grid-cols-12">
          <div className="space-y-4 col-span-12 md:col-span-5">
            <div className="bg-indigo-50 p-3 rounded-xl space-y-4">
              <div className="text-[10px]">{strategy?.project.description}</div>
              <div className="space-y-2">
                <a
                  href={strategy.project.website || "#"}
                  target="_blank"
                  rel="noredirect"
                  className="border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1"
                >
                  <GlobeSimple weight="bold" size={16} />
                  <div className="w-full text-[10px] leading-none">
                    {strategy.project.website}
                  </div>
                  <ArrowSquareOut weight="bold" size={16} />
                </a>
                {/* 
                TODO: Once we have added github into the projects table
                we would uncomment this
                <a
                  href="#"
                  target="_blank"
                  rel="noredirect"
                  className="border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1"
                >
                <GithubLogo weight="bold" size={16} />
                <div className="w-full text-[10px] leading-none">
                  @project_github
                </div>
                <ArrowSquareOut weight="bold" size={16} />
              </a> */}
                {strategy.project.twitter && (
                  <a
                    href={strategy.project.twitter || "#"}
                    target="_blank"
                    rel="noredirect"
                    className="border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1"
                  >
                    <TwitterLogo weight="bold" size={16} />
                    <div className="w-full text-[10px] leading-none">
                      {strategy?.project.twitter}
                    </div>
                    <ArrowSquareOut weight="bold" size={16} />
                  </a>
                )}
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-indigo-300">
                <div className="text-md">Score</div>
                <div className="px-1 border border-indigo-300 rounded">
                  <Score rank={strategy.smart_ranking || 0.0} icon={false} />
                </div>
              </div>
              <div className="text-[10px]">{strategy?.reasoning}</div>
              <div className="grid gap-2 grid-cols-3 items-center">
                {[
                  {
                    category: "Funding Needs",
                    value: strategy.funding_needed,
                  },
                  { category: "Impact", value: strategy.impact },
                  {
                    category: "Relevance",
                    value: strategy.interest,
                  },
                ].map((item, i) => (
                  <div
                    className="rounded-md p-1.5 border border-indigo-200 leading-none space-y-1.5 w-full"
                    key={i}
                  >
                    <div className="text-[8px] text-indigo-400 uppercase tracking-loose leading-none">
                      {item.category}
                    </div>
                    <div className="text-md">
                      {((item.value as number) * 10).toFixed(2)}
                      <span className="text-xs text-indigo-400 leading-none">
                        /10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 col-span-12 md:col-span-7">
            <ReactMarkdown>{strategy?.report}</ReactMarkdown>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectModal;
