<script lang = "ts">
	import DateInput from "../forms/DateInput.svelte";


interface Props {
    rank: number;
    played: number;
    record: string;
    drivebase: string;
    weight: string;
    averageVelocity: string;
    averageAuto: number;
    averageTele: number;
    averageEndgame: number;
}

const data: Props = {
    rank: ,
    played: ,
    record: "",
    drivebase: '',
    weight: '',
    averageVelocity: '',
    averageAuto: ,
    averageTele: ,
    averageEndgame: ,
};


const Table: Props = {
    return (
        <table>
            <tbody>
                <tr>
                    <th>Rank</th>
                    <td>0</td>
                </tr>
                <tr>
                    <th>Played</th>
                    <td>0</td>
                </tr>
                <tr>
                    <th>Record</th>
                    <td>
                        "0"
                        " - "
                        "0"
                        " - "
                        "0"
                    </td>
                </tr>
                <tr>
                    <th>Drivebase</th>
                    <td>"Nothing to show currently"</td>
                </tr>
                <tr>
                    <th>Weight</th>
                    <td>"Nothing to show currently"</td>
                </tr>
                <tr>
                    <th>Average Velocity</th>
                    <td>
                        "0.00"
                        " ft/s"
                    </td>
                </tr>
                <tr>
                    <th>Average Auto</th>
                    <td>0</td>
                </tr>
                <tr>
                    <th>Average Tele</th>
                    <td>0</td>
                </tr>
                <tr>
                    <th>Average Engame</th>
                    <td>0</td>
                </tr>
            </tbody>
        </table>
    );
}; 