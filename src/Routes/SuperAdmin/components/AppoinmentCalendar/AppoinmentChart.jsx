// import moment from "moment-timezone";
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

export default function ScheduleChart({ event }) { // setMainState, dataRows
    // ChartJS?.register(ArcElement, Tooltip, Legend);
    if (!event) return <></>;
    // const dataValues = dataRows.map((item) => getMinutesBetweenDates(item.start, item.end))
    // const available = getMinutesBetweenDates(event.start, event.end) - dataValues.reduce((a, b) => a + b, 0);
    // const data = {
    //     labels: ["Available Time", ...dataRows.map((item) => item.patientInfo.firstName)],
    //     datasets: [
    //         {
    //             label: 'Time in Minutes',
    //             // data: [12, 19, 3, 5, 2, 3],
    //             data: [available, ...dataValues],
    //             backgroundColor: [
    //                 'rgba(00, 255, 00, 0.5)',
    //                 'rgba(255, 99, 132, 0.5)',
    //                 'rgba(54, 162, 235, 0.5)',
    //                 'rgba(255, 206, 86, 0.5)',
    //                 'rgba(75, 192, 192, 0.5)',
    //                 'rgba(153, 102, 255, 0.5)',
    //                 'rgba(255, 159, 64, 0.5)',
    //             ],
    //             borderColor: [
    //                 'rgba(00, 255, 00, 1)',
    //                 'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //                 'rgba(75, 192, 192, 1)',
    //                 'rgba(153, 102, 255, 1)',
    //                 'rgba(255, 159, 64, 1)',
    //             ],
    //             borderWidth: 1,
    //         },
    //     ],
    // };
    // return <Pie data={data} />
    return <></>
}
// const getMinutesBetweenDates = (start = 0, end = 0) => {
//     if (!start || !end) return 0;
//     return Math.round(moment.duration(moment(end).diff(moment(start))).asMinutes())
// }