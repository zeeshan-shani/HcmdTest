import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { CONST } from "utils/constants";
import taskCategoryService from "services/APIs/services/taskCategoryService";
import classes from "../TasksPage.module.css";
import BoardCard from "./BoardCard";

export default function TaskBoard({
	activeTaskChat,
	taskCards,
	activeTaskList,
	addNewTaskHandler,
	taskDeleteHandler,
	userDesignations,
	disabledAddDelete
}) {

	const { data: taskCategories } = useQuery({
		queryKey: ["/taskCategory/list"],
		queryFn: async () => {
			const data = await taskCategoryService.list({});
			if (data?.status === 1) return data.data;
			return [];
		},
		keepPreviousData: false,
		staleTime: CONST.QUERY_STALE_TIME.L1,
	});

	return (<>
		<div className={`flex-1 ${classes.scrumboard}`}>
			{activeTaskChat &&
				<DragDropContext>
					<Droppable droppableId="card" type="card" direction="horizontal" isDragging={true}>
						{(provided) => (
							<div className={`task-boards d-flex overflow-auto w-100`} style={{ gap: '.5rem' }} ref={provided.innerRef}>
								{taskCards.map((card, index) => (
									<React.Fragment key={card.id}>
										<BoardCard
											title={card.title}
											tasks={activeTaskList?.filter((item) => item.type === card.id)}
											activeTaskChat={activeTaskChat}
											droppableId={card.id}
											index={index}
											addNewTaskHandler={addNewTaskHandler}
											taskDeleteHandler={taskDeleteHandler}
											card={card}
											userDesignations={userDesignations}
											taskCategories={taskCategories}
											disabledAddDelete={disabledAddDelete}
										/>
									</React.Fragment>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>}
		</div>
	</>);
}