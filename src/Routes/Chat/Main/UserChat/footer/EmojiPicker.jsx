import React, { useEffect, useRef } from 'react'
import { Picker } from 'emoji-mart';
import data from "@emoji-mart/data";
import "./css/emoji-mart.css";

export default function EmojiPicker(props) {
    const ref = useRef();
    useEffect(() => {
        new Picker({ ...props, data, ref, });
        //eslint-disable-next-line
    }, [props.perLine]);

    return <div ref={ref} />;
};
