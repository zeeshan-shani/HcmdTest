import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default function ModalReactstrap({
    size = 'md',
    show = false, toggle, Modalprops, bodyClasses = '', closeBtns, bodyProps = {}, modalClassName = '',
    body = <></>, header, footer = false, backdrop, scrollable = false }) {
    return (
        <Modal
            size={size}
            isOpen={show}
            backdrop={backdrop}
            toggle={toggle}
            centered
            {...Modalprops}
            modalClassName={`hide-scrollbar ${modalClassName}`}
            scrollable={scrollable}
        >
            {header &&
                <ModalHeader toggle={toggle} close={closeBtns}>{header}</ModalHeader>}
            <ModalBody className={bodyClasses} {...bodyProps}>
                {body}
            </ModalBody>
            {footer &&
                <ModalFooter>
                    {footer}
                </ModalFooter>}
        </Modal>
    )
}
