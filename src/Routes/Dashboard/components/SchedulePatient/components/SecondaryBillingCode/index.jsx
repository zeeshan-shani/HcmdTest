import { useCallback, useState } from "react";
import ReactSelect from "react-select";
import { TakeConfirmation } from "Components/components";
import { showSuccess } from "utils/package_config/toast";

function SecondaryBillingCode({
    indexValue, paymentCode = [], paymentOptions, onUpdate, isMulti = false, row, apiRef
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    const onUpdateCodes = useCallback(async (data) => {
        try {
            let addedCode = [], removedCode = [];
            if (isMulti) {
                const oldArr = paymentCode?.map(i => i.value) || [];
                const newArr = data.map(i => i.value) || [];
                addedCode = newArr?.filter(item => !oldArr.includes(item));
                removedCode = oldArr?.filter(item => !newArr.includes(item));
            } else {
                addedCode = data.map(i => i.value) || [];
            }
            const onDoneChange = async () => {
                setIsUpdating(true)
                await onUpdate({ addedCode, removedCode });
                showSuccess("Billing codes updated successfully");
                setIsUpdating(false);
            }
            if (!!addedCode.length) onDoneChange()
            else
                TakeConfirmation({
                    title: "Are you sure to change the billing code?",
                    onDone: onDoneChange
                })
        } catch (error) {
            console.error(error);
            setIsUpdating(false)
        }
    }, [paymentCode, onUpdate, isMulti]);

    const onBillingCodeClick = useCallback((e) => {
        e.stopPropagation();
        const expanded = apiRef.current.getExpandedDetailPanels();
        if (expanded.includes(row.id)) apiRef.current.toggleDetailPanel(row.id)
    }, [apiRef, row.id]);

    return (<>
        <div onClick={onBillingCodeClick} className="py-2 w-100">
            <ReactSelect
                name={"billingCode"}
                value={paymentCode}
                onChange={(data) => isMulti ? onUpdateCodes(data) : onUpdateCodes([data])}
                options={paymentOptions ? paymentOptions : []}
                className="basic-multi-select issue-multi-select_user-dropdown input-border min-width-160"
                classNamePrefix="billingcode_select"
                placeholder='Billing code'
                menuPlacement={indexValue > 2 ? "top" : "bottom"}
                maxMenuHeight={200}
                isMulti={isMulti}
                isDisabled={isUpdating}
                isLoading={isUpdating}
            />
        </div>
    </>)
}
export default SecondaryBillingCode;