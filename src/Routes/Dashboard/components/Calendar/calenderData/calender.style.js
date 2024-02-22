import styled from "styled-components";

const calenderWrapper = styled.div`
  .rbc-addons-dnd {
    max-width: 100% !important;
  }
  .rbc-label {
    padding: 8px 6px;
    font-family: "muli-semi-bold";
  }
  .rbc-today {
    background-color: "transparent";
  }
  .rbc-agenda-view table {
    tbody > tr > td {
      padding: 12px 6px;
    }
  }
  .rbc-time-view {
    border: 1px solid #dae5f0;
    border-bottom: 0;
    .rbc-time-header-content {
      border: 0;
      .rbc-time-header-cell {
        border-bottom: 1px solid #dae5f0;
        border-left: 1px solid #dae5f0;
      }
    }
  }
  .rbc-header {
    border: 0 !important;
    text-align: right !important;
    span {
      font-family: "muli-semi-bold";
    }
  }
  .rbc-month-view {
    border: 0;
    .rbc-month-row {
      border: 0;
      min-height: 128px;
    }
  }
  .rbc-day-slot .rbc-time-slot {
    opacity: 0.5;
  }
  .rbc-time-gutter {
    border-top: 1px solid #dae5f0;
  }
  .rbc-timeslot-group {
    min-height: 64px;
    border-bottom: 1px solid #dae5f0;
  }
  .rbc-time-content {
    border: 0;
  }
  .rbc-date-cell {
    padding: 8px;
    font-size: 16px !important;
    font-weight: 400;
    > a {
      color: #6c757d !important;
      font-family: "muli-semi-bold";
    }
  }
  .rbc-event.rbc-selected {
    background-color: white;
  }

  .rbc-show-more {
    color: #563c91;
  }

  .rbc-event {
    border-radius: 4;
    padding: 2px 10px;
    min-height: 40px !important;
    background-color: white;
    color: black;
    border: 1px solid #dae5f0;
    border-radius: 6px;
    border-right: 6px solid #563c91;
    box-shadow: 0 0.46875rem 2.1875rem rgba(0, 0, 0, 0.03),
      0 0.9375rem 1.40625rem rgba(0, 0, 0, 0.03),
      0 0.25rem 0.53125rem rgba(0, 0, 0, 0.05),
      0 0.125rem 0.1875rem rgba(0, 0, 0, 0.03);
    .rbc-event-content {
      font-size: 14px;
      font-family: "muli-semi-bold";
      white-space: pre-line;
    }
    &:focus {
      outline: 0 !important;
    }
  }

  .rbc-month-row {
    .rbc-event {
      min-height: 20px !important;
    }
  }

  .rbc-row-segment {
    padding: 0 4px 4px 4px;
  }

  .rbc-addons-dnd
    .rbc-addons-dnd-resizable-month-event
    .rbc-addons-dnd-resize-month-event-anchor:first-child {
    left: 0;
    top: 0;
    bottom: 0;
    height: auto;
  }
  .rbc-addons-dnd
    .rbc-addons-dnd-resizable-month-event
    .rbc-addons-dnd-resize-month-event-anchor:last-child {
    right: 0;
    top: 0;
    bottom: 0;
    height: auto;
  }

  .rbc-day-bg {
    border: 1px solid #dae5f0 !important;
    margin: 1px;
    border-radius: 6px;
  }

  .rbc-allday-cell {
    .rbc-row-bg {
      .rbc-day-bg {
        border: 1px solid #dae5f0 !important;
        border-top: 0 !important;
        border-right: 0 !important;
        margin: 0px !important;
        border-radius: 0px !important;
      }
    }
  }

  .rbc-off-range-bg {
    background: #f1f2f5 !important;
  }

  .rbc-agenda-view table.rbc-agenda-table {
    border: 0 !important;
    .rbc-agenda-date-cell {
      font-family: "muli-bold" !important;
    }
    td,
    span {
      font-family: "muli-regular";
      font-size: 13px;
      color: #6c757d !important;
    }
  }

  .rbc-agenda-content {
    border: 1px solid #dae5f0 !important;
    margin-top: 10px;
  }

  .calender-toolbar-container {
    background-color: #fff;
    margin: 0px -15px 15px;
    // box-shadow: 0 0.46875rem 2.1875rem rgba(0,0,0,0.03), 0 0.9375rem 1.40625rem rgba(0,0,0,0.03), 0 0.25rem 0.53125rem rgba(0,0,0,0.05), 0 0.125rem 0.1875rem rgba(0,0,0,0.03);
    border-radius: 6px 6px 0px 0px;
    // border: 1px solid rgba(0,0,0,0.125);
    padding: 15px;

    .label-date {
      b {
        font-family: "muli-bold";
      }
      span {
        font-family: "muli-medium";
      }
    }

    .navigation-buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .btn {
        background-color: white;
        color: #563c91;
        transition: all 0.3s ease-in;
        &:hover {
          box-shadow: 0 0.46875rem 2.1875rem rgba(0, 0, 0, 0.03),
            0 0.9375rem 1.40625rem rgba(0, 0, 0, 0.03),
            0 0.25rem 0.53125rem rgba(0, 0, 0, 0.05),
            0 0.125rem 0.1875rem rgba(0, 0, 0, 0.03);
          border-radius: 6px;
          border: 1px solid rgba(0, 0, 0, 0.125);
        }
        &:focus {
          box-shadow: none;
        }
        @media (max-width: 575.98px) {
          margin-left: 5px;
        }
      }
    }
  }

  .filter-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    @media (max-width: 575.98px) {
      .title {
        min-width: 100%;
        margin-left: 5px;
        margin-bottom: 10px;
      }
      flex-wrap: wrap;
    }
    .btn {
      background-color: white;
      padding: 0;
      height: 30px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 5px;
      transition: all 0.3s ease-in;
      &:hover {
        box-shadow: 0 0.46875rem 2.1875rem rgba(0, 0, 0, 0.03),
          0 0.9375rem 1.40625rem rgba(0, 0, 0, 0.03),
          0 0.25rem 0.53125rem rgba(0, 0, 0, 0.05),
          0 0.125rem 0.1875rem rgba(0, 0, 0, 0.03);
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.125);
      }
      &:focus {
        box-shadow: none;
      }
    }
  }
`;

export default calenderWrapper;
