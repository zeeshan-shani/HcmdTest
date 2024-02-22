import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

export const OnPasteDialogue = ({ fullScreen, open, handleClose, onMessage, onTask }) => {
    return (
        <Dialog fullScreen={fullScreen} open={open} onClose={handleClose} aria-labelledby="responsive-dialog-title">
            <DialogTitle id="responsive-dialog-title">
                {"Please Confirm"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Do you want to send file as message or task attachment?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={onMessage}>Message</Button>
                <Button onClick={onTask}>Task</Button>
            </DialogActions>
        </Dialog>
    )
}
