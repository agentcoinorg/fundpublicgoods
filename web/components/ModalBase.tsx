import { PropsWithChildren } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";
import { X } from "@phosphor-icons/react";
import Button from "./Button";

export interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  panelStyles?: {
    maxWidth?: string;
    other?: string;
  };
  contentStyles?: {
    padding?: string;
    "max-h"?: string;
    spacing?: string;
    overflow?: string;
    other?: string;
  };
}

export default function Modal(props: PropsWithChildren<ModalProps>) {
  const { title, isOpen, onClose, panelStyles, contentStyles, children } =
    props;
  const maxWidth = panelStyles?.maxWidth ?? "max-w-[540px]";

  const defaultContentStyles = clsx(
    "bg-white [scrollbar-gutter:stable]",
    contentStyles?.padding ? contentStyles?.padding : "p-8 pr-[1.5rem]",
    contentStyles?.["max-h"]
      ? contentStyles?.["max-h"]
      : "max-h-[calc(100vh-72px)] md:max-h-[calc(100vh-96px)]",
    contentStyles?.spacing ? contentStyles?.spacing : "space-y-8",
    contentStyles?.overflow ? contentStyles?.overflow : "overflow-y-auto",
    contentStyles?.other
  );

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-30' onClose={onClose}>
          <div className='fixed inset-0 overflow-y-auto bg-indigo-900/50 backdrop-blur [scrollbar-gutter:stable] '>
            <div className='flex min-h-full items-center justify-center p-1 text-center md:p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'>
                <Dialog.Panel
                  className={clsx(
                    "w-full transform overflow-hidden rounded-2xl rounded-none bg-indigo-800 text-left align-middle shadow-xl transition-all",
                    maxWidth
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <div className='flex items-center justify-between border-b-2 border-indigo-600 bg-indigo-100 px-8 py-4'>
                    <Dialog.Title as='h3' className='text-lg font-medium'>
                      {title}
                    </Dialog.Title>
                    <Button
                      variant='icon'
                      onClick={onClose}
                      className='group translate-x-2 transform !shadow-none'>
                      <X
                        size={20}
                        color='white'
                        weight='bold'
                        className='transition-opacity duration-300 ease-in-out group-hover:opacity-50'
                      />
                    </Button>
                  </div>
                  <div className={defaultContentStyles}>{children}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
