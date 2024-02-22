import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const TimeoutModal = ({ showModal, togglePopup, handleStayLoggedIn, handleLogout }) => {
    return <Modal isOpen={showModal} toggle={togglePopup} keyboard={false} backdrop="static">
        <ModalHeader>Session Timeout!</ModalHeader>
        <ModalBody>
            <p className='text-color'>
                {`Your session is about to expire at any moment due to inactivity. You will be redirected to the login page.`}
            </p>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={handleLogout}>Logout</Button>
            <Button color="primary" onClick={handleStayLoggedIn}>Stay Logged In</Button>
        </ModalFooter>
    </Modal>
}

export default TimeoutModal;