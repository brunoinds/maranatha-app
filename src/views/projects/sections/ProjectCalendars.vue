<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <article :style="{overflow: 'scroll'}">
            <table class="schedule">
                <thead>
                    <tr>
                        <th>Phase</th>
                        <th>Task</th>
                        <th v-for="day in constructionProgressTableUI.columnsDays" :key="day.date">{{ day.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in constructionProgressTableUI.rows" :key="row.task.id">
                        <td><button class="button-phase" @click="onClickPhase(row.phase)"><b v-if="row.isFirstTask">{{ row.phase.name }}</b></button></td>
                        <td><button class="button-task" @click="onClickTask(row.phase, row.task)">{{ row.task.name }}</button></td>
                        <td v-for="slot in row.slots" :key="slot.date">
                            <button class="button-checker" :style="{backgroundColor: slot.backgroundColor}" @click="onClickDay(row.phase, row.task, slot.date)">
                                <ion-icon color="success" v-if="slot.hasDailyReport" :icon="checkmarkCircle"></ion-icon>
                                <ion-icon color="danger" v-if="!slot.hasDailyReport && slot.wasForgottenToDailyReport" :icon="closeCircleOutline"></ion-icon>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </article>
    </section>
</template>


<script setup lang="ts">

import CreateProjectConstructionDailyReport from '@/dialogs/CreateProjectConstructionDailyReport/CreateProjectConstructionDailyReport.vue';
import EditProjectConstructionDailyReport from '@/dialogs/EditProjectConstructionDailyReport/EditProjectConstructionDailyReport.vue';
import EditProjectConstructionPhase from '@/dialogs/EditProjectConstructionPhase/EditProjectConstructionPhase.vue';
import EditProjectConstructionTask from '@/dialogs/EditProjectConstructionTask/EditProjectConstructionTask.vue';
import { IProjectConstructionPhase, IProjectConstructionTask, IProjectJob } from '@/interfaces/ProjectsInterfaces';
import { Dialog } from '@/utils/Dialog/Dialog';
import { IonIcon, IonProgressBar } from '@ionic/vue';
import chroma from "chroma-js";
import { checkmarkCircle, closeCircleOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { PropType, computed, onMounted, ref } from 'vue';

const isLoading = ref<boolean>(false);
const props = defineProps({
    projectJob: {
        type: Object as PropType<IProjectJob>,
        required: true
    }
});

const projectJobData = computed(() => {
    return props.projectJob;
})

const constructionProgressTableUI = computed(() => {
    const scheduledDaysCount = Math.ceil(DateTime.fromISO(projectJobData.value?.scheduled_end_date as string).diff(DateTime.fromISO(projectJobData.value?.scheduled_start_date  as string), 'days').days);

    const daysMatrix = Array.from({ length: scheduledDaysCount }, (_, i) => {
        return {
            date: DateTime.fromISO(projectJobData.value?.scheduled_start_date as string).plus({ days: i }).toISODate() as string,
        }
    })

    const constructionPhasesOrdered = projectJobData.value?.construction_phases?.toSorted((a, b) => {
        //Sort order, always from the oldest to the newest scheduled_start_date, if same day, then sort by scheduled_end_date where the oldest is last:
        if (a.scheduled_start_date === b.scheduled_start_date) {
            return a.scheduled_end_date > b.scheduled_end_date ? 1 : -1;
        }
        return a.scheduled_start_date > b.scheduled_start_date ? 1 : -1;
    }).map((phase) => {
        return {
            ...phase,
            tasks: phase.tasks?.toSorted((a, b) => {
                //Sort order, always from the oldest to the newest scheduled_start_date, if same day, then sort by scheduled_end_date where the oldest is last:
                if (a.scheduled_start_date === b.scheduled_start_date) {
                    return a.scheduled_end_date > b.scheduled_end_date ? 1 : -1;
                }
                return a.scheduled_start_date > b.scheduled_start_date ? 1 : -1;
            })
        }
    })

    
    const rows:{
        task: IProjectConstructionTask, 
        phase: IProjectConstructionPhase, 
        isFirstTask: boolean, 
        slots: {
            date: string, 
            isParticipant: boolean,
            backgroundColor: string,
            wasForgottenToDailyReport: boolean,
            hasDailyReport: boolean
        }[]
    }[] = [];

    constructionPhasesOrdered?.forEach((phase) => {
        phase.tasks?.forEach((task, index) => {
            rows.push({
                task,
                phase: phase,
                isFirstTask: index == 0,
                slots: daysMatrix.map((day) => {
                    const dailyReport = task.daily_reports?.find((report) => DateTime.fromISO(report.date as string).toISODate() === DateTime.fromISO(day.date).toISODate());
                    const isParticipant = (DateTime.fromISO(day.date).toISODate() >= DateTime.fromISO(task.scheduled_start_date as string).toISODate()) && (DateTime.fromISO(day.date).toISODate() <= DateTime.fromISO(task.scheduled_end_date as string).toISODate());
                    const wasForgottenToDailyReport = (() => {
                        if (!isParticipant){
                            return false;
                        }
                        if (dailyReport){
                            return false;
                        } else {
                            return DateTime.fromISO(day.date).toISODate() < DateTime.now().toISODate();
                        }
                    })();
                    const hasDailyReport = dailyReport ? true : false;



                    return {
                        date: day.date,
                        isParticipant,
                        backgroundColor: isParticipant ? chroma(phase.color).brighten(2.5).hex() : 'transparent',
                        wasForgottenToDailyReport,
                        hasDailyReport
                    }
                })
            })
        })
    })

    return {
        columnsDays: daysMatrix.map((day) => {
            return {
                date: day.date,
                label: DateTime.fromISO(day.date as string).toFormat('dd/MM'),
            }
        }),
        rows: rows
    }
})

const onClickDay = (phase:IProjectConstructionPhase, task:IProjectConstructionTask, date:string) => {
    const dailyReport = task.daily_reports?.find((report) => DateTime.fromISO(report.date as string).toISODate() === DateTime.fromISO(date).toISODate());

    const createConstructionDailyReport = () => {
        Dialog.show(CreateProjectConstructionDailyReport, {
            props: {
                projectJob: projectJobData.value,
                constructionTask: task,
                constructionPhase: phase,
                date: date  
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    
                })
                
            },
        })
    }

    const editConstructionDailyReport = () => {
        if (dailyReport){
            Dialog.show(EditProjectConstructionDailyReport, {
                props: {
                    projectJob: projectJobData.value,
                    constructionTask: task,
                    constructionPhase: phase,
                    date: date,
                    dailyReport: dailyReport
                },
                onLoaded($this) {
                    $this.on('selected', (event:any) => {
                        
                    })
                    
                },
            })
        }
    }
    
    
    if (dailyReport){
        editConstructionDailyReport();
    } else {
        createConstructionDailyReport();
    }
}

const onClickPhase = (phase:IProjectConstructionPhase) => {
    Dialog.show(EditProjectConstructionPhase, {
        props: {
            projectJob: projectJobData.value,
            projectConstructionPhase: phase,
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                
            })
            
        },
    })
}
const onClickTask = (phase:IProjectConstructionPhase, task:IProjectConstructionTask) => {
    Dialog.show(EditProjectConstructionTask, {
        props: {
            projectJob: projectJobData.value,
            projectConstructionTask: task,
            projectConstructionPhase: phase,
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                
            })
            
        },
    })
}

onMounted(() => {
    
});
</script>

<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
ion-fab[slot="fixed"]{
    position: fixed;
}

table {
	&.schedule {
		border: 1px solid #1C6EA4;
		background-color: transparent;
		width: 100px;
		text-align: center;
		border-collapse: collapse;
		tbody {
			td {
				font-size: 13px;
                position: relative;
                height: 30px;

                > button.button-checker{
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    font-size: 18px;

                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 20px;
                }

                > button.button-phase{
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    font-size: 18px;
                    background-color: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 20px;
                }

                > button.button-task{
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    font-size: 18px;
                    background-color: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
			}
		}
		thead {
			background: #1C6EA4;
			th {
				font-size: 14px;
				font-weight: bold;
				color: #FFFFFF;
				text-align: center;
				border-left: 1px solid #D0E4F5;
				&:first-child {
					border-left: none;
				}
			}
		}
	}
}
table.schedule td, table.schedule th {
	border: 1px solid #AAAAAA;
	padding: 3px 2px;
}

</style>

