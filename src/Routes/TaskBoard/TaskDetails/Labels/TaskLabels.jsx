export const TaskLabels = ({ taskDetails, isTemplate }) => {

    const categoryField = isTemplate ? "templateCategories" : "messageTaskCategories"
    const categoryFieldInfo = isTemplate ? "templateCategoryInfo" : "categoryInfo"

    return (
        <div className="col-sm-6 col-md-12">
            <div className="card mb-2 light-shadow">
                <div className="card-body p-2 text-center">
                    <h6>Category</h6>
                    {!!taskDetails[categoryField]?.length ?
                        (taskDetails[categoryField]?.map((item) => {
                            const { colorCode = '', name = '' } = item[categoryFieldInfo];
                            return (
                                <span className={`badge text-white p-1`} key={item.categoryId}
                                    style={{ backgroundColor: colorCode || '#000', margin: "4px 4px", padding: "2px" }}>
                                    {name}
                                </span>)
                        })) :
                        <span>No categories mentioned</span>}
                </div>
            </div>
        </div>
    );
}