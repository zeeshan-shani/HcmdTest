import styled from "styled-components";
const ScrumboardWrapper = styled.div`
	width: 100%;
	.new-board {
		border-radius: 6px;
		background-color: #fff;
		height: 150px;
		text-align: center;
		align-content: center;
	}

	.scrum-board {
		position: absolute;
		display: flex;
		overflow: auto;
		width: 98%;
		min-height: calc(100vh - 191px);
		margin-top: 10px;
		.board-card {
			margin: 8px;
		}
	}

	.board-toolbar {
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.125);
		background-color: white;
		@media (max-width: 575.98px) {
			margin-top: 15px;
		}
	}

	.board-card {
		background-color: #f1f2f5;
		height: 100%;
	}

	.column-title {
		padding: 8px;
	}

	.card-task-member {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.member {
			margin: 5px;
			img {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				object-fit: cover;
			}
		}
	}

	.task-title,
	.column-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.title {
			white-space: nowrap;
			width: 200px;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.board-task-card {
		background-color: white;
		padding: 8px;
		border-radius: 3px;
		cursor: pointer;
		margin-bottom: 10px;
		.task-cover {
			img {
				width: 100%;
				border-radius: 7px;
				margin: 3px 0;
				height: 127px;
				object-fit: cover;
			}
		}
		.status-block {
			display: flex;
			margin: 5px 0;
			.task-status {
				width: 30px;
				height: 10px;
				background-color: yellow;
				border-radius: 50px;
				margin-right: 2px;
				cursor: pointer;
			}
		}
		.status-block {
			display: flex;
			margin: 5px 0;
			.msg-task-status {
				width: 10px;
				height: 10px;
				background-color: yellow;
				border-radius: 50px;
				margin-right: 2px;
				cursor: pointer;
			}
		}
		.more_icon {
			i {
				font-size: 16px;
				color: #6b778c;
				cursor: pointer;
			}
		}

		.task-options,
		.counts {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			.icon-space {
				margin-left: 12px;
				font-size: 14px;
				color: #6b778c;
			}
			.count-space {
				margin-left: 4px;
				color: #afbcca;
				font-size: 12px;
			}
		}
	}

	.add-card-block {
		background: white;
		min-width: 250px;
		padding: 10px;
		margin: 8px 20px 0 8px;
	}

	.board {
		border-radius: 6px;
		background-color: #fff;
		padding: 10px;
	}

	.board-name-input {
		width: 85%;
		border: 0;
		outline: 0;
		padding: 11px;
		font-size: 14px;
		text-align: center;
	}

	.board-card-scroll {
		max-height: calc(100vh - 290px);
		overflow: auto;
	}

	.board-card-height {
		max-height: calc(100vh - 365px);
	}

	.board-title {
		color: #42526e;
	}

	.board-action {
		color: #42526e;
	}

	.scrum-container {
		overflow: auto;
		width: 100%;
	}

	.board-grid {
		.board-more-option {
			text-align: right;
		}
		transition: all 1s;
		&:hover {
			box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
				0px 6px 10px 0px rgba(0, 0, 0, 0.14),
				0px 1px 18px 0px rgba(0, 0, 0, 0.12) !important;
		}
	}

	.board-list-title {
		color: ${(props) => props.layoutTheme.textColor};
	}

	.transparent-button {
		background-color: transparent;
		border: 0;
		&:focus {
			outline: 0;
		}
	}
`;

export default ScrumboardWrapper;
