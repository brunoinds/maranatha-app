<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons>
                    <ion-back-button :defaultHref="'/inventory'"></ion-back-button>
                </ion-buttons>
                <ion-title>Pedido #00{{ outcomeRequestId }}</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
            <ion-toolbar v-if="false">
                <ion-segment v-model="viewModeAs">
                    <ion-segment-button value="Requester">
                        Solicitante
                    </ion-segment-button>
                    <ion-segment-button value="Dispacher">
                        Almacén
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <header>
                <ion-list v-if="outcomeRequestData != null">
                    <ion-item>
                        <ion-label>
                            <h1><b>Pedido #00{{ outcomeRequestId }}</b></h1>
                            <p><b>Solicitado por {{ requestedByUser?.name }}</b></p>
                            <p>{{ outcomeRequestData?.requested_products.length }} productos</p>
                        </ion-label>
                        <OutcomeRequestStatusChip v-if="outcomeRequestData" :request="outcomeRequestData" :viewMode="viewModeAs" />
                    </ion-item>
                </ion-list>
                <ion-skeleton-text v-if="outcomeRequestData == null" animated style="height: 80px"></ion-skeleton-text>
            </header>
            
            <main class="content">
                <article section="panel" v-if="!outcomeRequestData" class="ion-padding" style="border-radius: 12px; overflow: hidden;">
                    <ion-skeleton-text animated style="height: 320px"></ion-skeleton-text>
                </article>

                <article section="panel" v-if="outcomeRequestData">
                    <article class="warehouse-requester" v-if="viewModeAs == 'Requester'">
                        <ion-card color="warning" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Draft">
                            <ion-card-header>
                                <ion-card-title>Envía tu pedido</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="alertCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Envía tu pedido al almacén para que sea aprobado y despachado.
                                <br><br>

                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" fill="outline" :color="currentDeviceTheme == 'dark' ? 'light' : 'dark'" @click="showEditOutcomeRequest()">
                                        <ion-icon slot="end" :icon="bagHandleOutline"></ion-icon>
                                        Cambiar productos solicitados
                                    </ion-button>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="success" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Requested)">
                                        <ion-icon slot="end" :icon="sendOutline"></ion-icon>
                                        Enviar mi pedido
                                    </ion-button>
                                    <ion-button expand="block" fill="clear" color="primary" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el almacén
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Requested">
                            <ion-card-header>
                                <ion-card-title>Esperando aprobación...</ion-card-title>
                                <ion-card-subtitle>PEDIDO ENVIADO</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="sendOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Su pedido ha sido enviado y está esperando por la aprobación del almacén.
                                <br><br>

                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="light" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Draft)">
                                        <ion-label color="danger">
                                            Modificar mi pedido
                                        </ion-label>
                                        <ion-icon slot="end" color="danger" :icon="pencilOutline"></ion-icon>
                                    </ion-button>
                                    <ion-button expand="block" fill="clear" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el almacén
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Approved">
                            <ion-card-header>
                                <ion-card-title>Separando productos...</ion-card-title>
                                <ion-card-subtitle>PEDIDO APROBADO</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Su pedido ha sido aprobado. El almacén está separando los productos para enviarlos.
                                <br><br>

                                <article>
                                    <ion-button expand="block" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el almacén
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="danger" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Rejected">
                            <ion-card-header>
                                <ion-card-title>Pedido rechazado</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Su pedido ha sido rechazado. Verifica el chat, los productos solicitados y vuelve a enviar el pedido.
                                <br><br>
                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="light"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Draft)">
                                        Modificar mi pedido
                                        <ion-icon slot="end" :icon="pencilOutline"></ion-icon>
                                    </ion-button>
                                    <ion-button expand="block" fill="clear" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el almacén
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched">
                            <ion-card-header>
                                <ion-card-title>Esperando envío...</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="basketOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Tus productos ya han sido separados. Pronto saldrán en camino hacia tu dirección.
                                <br><br>
                                <article>
                                    <ion-button expand="block" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay">
                            <ion-card-header>
                                <ion-card-title>Productos en camino...</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="airplaneOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Tus productos están en el transporte hacia tu dirección. <br><br> <b>Al recibirlos, Ud. debe marcar que han llegado.</b>
                                <br><br>
                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="success"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Delivered)">
                                        <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                                        He recibido los productos
                                    </ion-button>
                                    <ion-button expand="block" fill="clear" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="warning" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered">
                            <ion-card-header>
                                <ion-card-title>Revisa los productos entregados</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="eyeOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Tus productos han sido entregados. Revisa si todos han llegado correctamente. 
                                <br><br> <b>Si algún producto falta o está dañado, notifícalo al almacén en el chat.</b>
                                <br><br>
                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="success"  @click="openOutcomeRequestReceiptProductsSelector">
                                        <ion-icon slot="end" :icon="sendOutline"></ion-icon>
                                        Revisar productos recibidos ahora
                                    </ion-button>
                                    <ion-button expand="block" fill="solid" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el almacén
                                    </ion-button>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" fill="clear" color="danger"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.OnTheWay)">
                                        <ion-icon slot="end" :icon="closeCircleOutline"></ion-icon>
                                        Cancelar recebimiento
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="success" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Finished">
                            <ion-card-header>
                                <ion-card-title>Pedido finalizado</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Pedido recibido y finalizado</b>
                                <br>
                                <p>Ud. recibió los productos correctamente y ha marcado como finalizado.</p>
                                <br>
                                

                                <ion-button expand="block" color="light" @click="openChat()">
                                    <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                    Chatear con el almacén
                                </ion-button>

                                <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" fill="clear" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Delivered)">
                                    <ion-icon color="light" slot="end" :icon="closeCircleOutline"></ion-icon>
                                    <ion-label color="light">
                                        Deshacer finalización
                                    </ion-label>
                                </ion-button>
                            </ion-card-content>
                        </ion-card>
                    </article>
                    <article class="warehouse-dispacher" v-if="viewModeAs == 'Dispacher'">
                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Draft">
                            <ion-card-header>
                                <ion-card-title>Esperando solicitud...</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="timeOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                El solicitante está modificando su pedido. Una vez que lo tenga listo, Ud. será notificado.
                                <br><br>

                                <article>
                                    <ion-button expand="block" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>
                        <ion-card color="warning" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Requested">
                            <ion-card-header>
                                <ion-card-title>Aprobar pedido</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="alertCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Este pedido está esperando por su aprobación. Revisa los productos solicitados y aprueba o rechaza el pedido.
                                <br><br>

                                <article>
                                    <section style="display: flex; align-items: center; justify-content: space-between;">
                                        <ion-button :disabled="isLoadingAreas.outcomeRequest" style="width: 100%" color="success" expand="block"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Approved)">
                                            <ion-label>
                                                Aprobar pedido
                                            </ion-label>
                                            <ion-icon slot="start" :icon="thumbsUpOutline"></ion-icon>
                                        </ion-button>
                                        <ion-button  :disabled="isLoadingAreas.outcomeRequest" fill="outline" style="width: 100%" color="danger" expand="block"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Rejected)">
                                            <ion-label>
                                                Rechazar
                                            </ion-label>
                                            <ion-icon slot="start" :icon="thumbsDownOutline"></ion-icon>
                                        </ion-button>
                                    </section>
                                    <ion-button expand="block" fill="clear" color="primary" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="danger" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Rejected">
                            <ion-card-header>
                                <ion-card-title>Pedido rechazado</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Ud. ha rechazado este pedido. El solicitante ha sido notificado.
                                <br><br>
                                <article>
                                    
                                    <ion-button expand="block"  color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" fill="clear" color="light"  @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Requested)">
                                        <ion-icon slot="end" :icon="closeCircleOutline"></ion-icon>
                                        Cancelar rechazo
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="warning" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Approved">
                            <ion-card-header>
                                <ion-card-title>Separa los productos</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="alertCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Separa en el stock los productos que serán enviados al solicitante.
                                <br><br>
                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="success" @click="createDispatch()">
                                        <ion-icon slot="end" :icon="sendOutline"></ion-icon>
                                        Separar productos ahora
                                    </ion-button>

                                    <ion-button expand="block"  color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>

                                    <ion-button expand="block" fill="clear" color="dark" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Requested)">
                                        <ion-icon slot="end"  color="danger" :icon="closeCircleOutline"></ion-icon>
                                        <ion-label color="danger">
                                            Cancelar aprobación
                                        </ion-label>
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="warning" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched">
                            <ion-card-header>
                                <ion-card-title>Esperando envío...</ion-card-title>
                                <ion-card-subtitle>Productos separados</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="alertCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Los productos del pedido ya han sido separados. Ahora envíalos al solicitante por un medio de transporte.
                                <br><br>
                                <article>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" color="success" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.OnTheWay)">
                                        <ion-icon slot="end" :icon="sendOutline"></ion-icon>
                                        Enviar productos ahora
                                    </ion-button>
                                    <ion-button expand="block"  color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>

                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" expand="block" fill="clear" color="dark" @click="undoDispatch()">
                                        <ion-icon slot="end"  color="danger" :icon="closeCircleOutline"></ion-icon>
                                        <ion-label color="danger">
                                            Cancelar separación de productos
                                        </ion-label>
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay">
                            <ion-card-header>
                                <ion-card-title>Entrega en camino...</ion-card-title>
                                <ion-card-subtitle>PEDIDO ENVIADO</ion-card-subtitle>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="airplaneOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Los productos están en el transporte hacia el solicitante. Él te notificará cuando los reciba.
                                <br><br>
                                <article>
                                    <ion-button expand="block"  color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                    <ion-button :disabled="isLoadingAreas.outcomeRequest" fill="clear" expand="block" color="danger" @click="changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Dispatched)">
                                        <ion-icon slot="end" :icon="closeCircleOutline"></ion-icon>
                                        Cancelar envío
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="primary" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered">
                            <ion-card-header>
                                <ion-card-title>Revisando entrega...</ion-card-title>
                                <ion-card-subtitle>PEDIDO ENTREGADO</ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                El pedido fue entregado al solicitante. Él está revisando si los productos han llegado correctamente.
                                <br><br>
                                <article>
                                    <ion-button expand="block" fill="clear" color="light" @click="openChat()">
                                        <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                        Chatear con el solicitante
                                    </ion-button>
                                </article>
                            </ion-card-content>
                        </ion-card>

                        <ion-card color="success" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Finished">
                            <ion-card-header>
                                <ion-card-title>Pedido finalizado</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Pedido recibido y finalizado</b>
                                <br><p>El solicitante ya recibió el pedido y ha marcado como finalizado.</p><br>
                                <ion-button expand="block" fill="solid" color="light" @click="openChat()">
                                    <ion-icon slot="end" :icon="chatbubbleEllipsesOutline"></ion-icon>
                                    Chatear con el solicitante
                                </ion-button>
                            </ion-card-content>
                        </ion-card>
                    </article>
                </article>

                <header section="general-tabs">
                    <article class="ion-padding">
                        <ion-segment v-model="requestSegmentView">
                            <ion-segment-button value="Overall">
                                <b>Resumen</b>
                            </ion-segment-button>
                            <ion-segment-button value="Products">
                                <b>Productos</b>
                            </ion-segment-button>
                        </ion-segment>
                    </article>
                </header>

                <article v-if="requestSegmentView == 'Overall'">
                    <article class="ion-padding" v-if="outcomeRequestData != null">
                        <VerticalTimeline :items="timelineUI"></VerticalTimeline>
                    </article>

                    <ion-list v-if="outcomeRequestData == null">
                        <ion-item v-for="i in 6" :key="i" lines="none">
                            <ion-skeleton-text  animated style="height: 20px"></ion-skeleton-text>
                        </ion-item>
                    </ion-list>

                    <article class="ion-padding">
                        <ion-button expand="block" fill="solid" color="danger" v-if="!isLoadingAreas.outcomeRequest && outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Draft && viewModeAs == 'Requester'" @click="deleteOutcomeRequest()">
                            <ion-icon slot="end" :icon="trashOutline"></ion-icon>
                            Borrar pedido
                        </ion-button>
                    </article>
                    

                </article>
                <article v-if="requestSegmentView == 'Products'">
                    <ion-list-header>Productos</ion-list-header>
                    <article class="ion-padding">
                        <section>
                            <ion-segment v-model="productListSegmentView">
                                <ion-segment-button value="Requested">
                                    🗳️ Solicitados
                                </ion-segment-button>
                                <ion-segment-button value="Dispached" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched || outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay || outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered || outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Finished">
                                    🚚 Despachados
                                </ion-segment-button>
                                <ion-segment-button value="Received" v-if="outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered || outcomeRequestData?.status == EInventoryWarehouseOutcomeRequestStatus.Finished">
                                    📥 Recibidos
                                </ion-segment-button>
                            </ion-segment>
                        </section>
                    </article>

                    <article>
                        <section v-if="productListSegmentView == 'Requested'">
                            <ion-progress-bar v-if="isLoadingAreas.outcomeRequest" type="indeterminate"></ion-progress-bar>

                            <article class="ion-padding">
                                <ion-button :disabled="isLoading" fill="outline" color="primary" @click="downloadRequestedProductsPDF()" expand="block">
                                    Imprimir pedido
                                    <ion-icon slot="end" :icon="printOutline"></ion-icon>
                                </ion-button>
                            </article>

                            <ion-list v-if="!isLoadingAreas.outcomeRequest">
                                <ion-item v-for="item in requestedItemsUI" :key="item.product?.id">
                                    <ion-avatar slot="start" v-if="item.product?.image">
                                        <img :src="item.product?.image" />
                                    </ion-avatar>
                                    <ion-label>
                                        <h2>{{ item.product?.name }}</h2>
                                        <p>{{ item.product?.description }}</p>
                                        <p>{{ item.product?.brand }}</p>
                                    </ion-label>
                                    <ion-label slot="end" class="ion-text-right">
                                        <h2><b>x{{ item.quantity }}</b></h2>
                                        <p v-if="item.product?.stock.in_stock_count >= item.quantity && viewModeAs == 'Dispacher'" style="color: green;">{{ item.product?.stock.in_stock_count }} en stock</p>
                                        <p v-if="item.product?.stock.in_stock_count == 0  && viewModeAs == 'Dispacher'" style="color: red;">Agotado en stock</p>
                                        <p v-if="item.product?.stock.in_stock_count != 0 && item.product?.stock.in_stock_count < item.quantity  && viewModeAs == 'Dispacher'" style="color: red;">solo {{ item.product?.stock.in_stock_count }} en stock</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </section>

                        <section v-if="productListSegmentView == 'Dispached'">
                            <ion-progress-bar v-if="isLoadingAreas.dispachedProducts" type="indeterminate"></ion-progress-bar>


                            <article class="ion-padding" v-if="viewModeAs == 'Dispacher' && outcomeRequestData?.inventory_warehouse_outcome_id && !isLoadingAreas.dispachedProducts">
                                <ion-button @click="openWarehouseOutcome()" expand="block">Ver detalles del despacho</ion-button>
                            </article>
                            
                            <ion-list v-if="!isLoadingAreas.dispachedProducts">
                                <ion-item v-for="item in dispachedItemsUI" :key="item.product?.id">
                                    <ion-avatar slot="start" v-if="item.product?.image">
                                        <img :src="item.product?.image" />
                                    </ion-avatar>
                                    <ion-label>
                                        <h2>{{ item.product?.name }}</h2>
                                        <p>{{ item.product?.description }}</p>
                                        <p>{{ item.product?.brand }}</p>
                                    </ion-label>
                                    <ion-label slot="end" color="warning" class="ion-text-right">
                                        <h2><b>x{{ item.quantity }}</b></h2>
                                    </ion-label>
                                </ion-item>
                            </ion-list>

                            <ion-list v-if="!isLoadingAreas.loanedProducts">
                                <ion-item v-for="item in loanedItemsUI" :key="item.product?.id" button @click="openLoanProduct(item.loanId)">
                                    <ion-avatar slot="start" v-if="item.product?.image">
                                        <img :src="item.product?.image" />
                                    </ion-avatar>
                                    <ion-label>
                                        <h2>{{ item.product?.name }}</h2>
                                        <p>{{ item.product?.description }}</p>
                                        <p>{{ item.product?.brand }}</p>
                                    </ion-label>
                                    <ion-label slot="end" color="warning" class="ion-text-right">
                                        <h2><b>Préstamo</b></h2>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </section>

                        <section v-if="productListSegmentView == 'Received'">
                            <ion-progress-bar v-if="isLoadingAreas.outcomeRequest" type="indeterminate"></ion-progress-bar>

                            <ion-list v-if="!isLoadingAreas.outcomeRequest">
                                <ion-item v-for="item in receivedItemsUI" :key="item.product?.id">
                                    <ion-avatar slot="start" v-if="item.product?.image">
                                        <img :src="item.product?.image" />
                                    </ion-avatar>
                                    <ion-label>
                                        <h2>{{ item.product?.name }}</h2>
                                        <p>{{ item.product?.description }}</p>
                                        <p>{{ item.product?.brand }}</p>
                                    </ion-label>
                                    <ion-label slot="end" class="ion-text-right" v-if="item.diff == 0" color="success">
                                        <h2><b>{{ item.received }}</b> recibidos</h2>
                                        <p>{{ item.sent }} enviados</p>
                                    </ion-label>
                                    <ion-label slot="end" class="ion-text-right" v-if="item.diff != 0" color="danger">
                                        <h2><b>{{ item.diffText }}</b></h2>
                                        <p>{{ item.sent }} enviados, {{ item.received }} recibidos</p>
                                        <h2></h2>
                                    </ion-label>

                                    <ion-icon slot="end" v-if="item.diff != 0" color="danger" :icon="alertCircleOutline"></ion-icon>
                                    <ion-icon slot="end" v-if="item.diff == 0" color="success" :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-item>
                            </ion-list>
                        </section>
                    </article>
                </article>
                <br><br>
            </main>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import OutcomeRequestStatusChip from '@/components/OutcomeRequestStatusChip/OutcomeRequestStatusChip.vue';
import VerticalTimeline from '@/components/VerticalTimeline/VerticalTimeline.vue';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseOutcomeRequest from '@/dialogs/EditInventoryWarehouseOutcomeRequest/EditInventoryWarehouseOutcomeRequest.vue';
import InventoryOutcomeRequestReceiptProductsSelector from '@/dialogs/InventoryOutcomeRequestReceiptProductsSelector/InventoryOutcomeRequestReceiptProductsSelector.vue';
import { EInventoryWarehouseOutcomeRequestStatus, IInventoryProductItem, IProduct, IProductWithWarehouseStock, IWarehouseOutcomeRequest, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { UsersStore } from '@/utils/Stored/UsersStore';
import { Theme } from '@/utils/Theme/Theme';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Capacitor } from '@capacitor/core';
import { alertController, IonAvatar, IonBackButton, IonButton, IonButtons, IonSkeletonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonSegment, IonSegmentButton, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { airplaneOutline, alertCircleOutline, basketOutline, chatbubbleEllipsesOutline, printOutline, checkmarkCircleOutline, closeCircleOutline, eyeOutline, pencilOutline, sendOutline, thumbsDownOutline, thumbsUpOutline, timeOutline, trashOutline, bagHandleOutline } from 'ionicons/icons';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const router = useRouter();
const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoadingAreas = ref({
    outcomeRequest: false,
    products: false,
    dispachedProducts: false,
    loanedProducts: false
});
const isLoading = ref<boolean>(false);
const outcomeRequestId = route.params.id as string;

const outcomeRequestData = ref<IWarehouseOutcomeRequest|null>(null);
const productsData = ref<Array<IProductWithWarehouseStock>>([]);
const dispachedProductsItemsData = ref<Array<IInventoryProductItem>>([]);
const loanedProductsItemsData = ref<Array<IWarehouseProductItemLoan>>([]);
const usersData = ref<Array<IUser>>([]);


const viewModeAs = ref<'Requester'|'Dispacher'>('Requester');
const isDeleted = ref(false);
const productListSegmentView = ref<'Requested'|'Dispached'|'Received'>('Requested');
const requestSegmentView = ref<'Overall'|'Products'>('Overall');

const requestedItemsUI = computed(() => {
    return outcomeRequestData.value?.requested_products.map((item) => {
        const product = productsData.value.find((product) => product.id === item.product_id);
        return {
            product: product,
            quantity: item.quantity
        }
    })
})
const dispachedItemsUI = computed(() => {
    let products:Array<{
        product: IProductWithWarehouseStock,
        quantity: number
    }> = [];

    dispachedProductsItemsData.value.forEach((item) => {
        const product = products.find((product) => product.product.id === item.inventory_product_id);

        if (product){
            product.quantity++;
        } else {
            products.push({
                product: productsData.value.find((product) => product.id === item.inventory_product_id) as IProductWithWarehouseStock,
                quantity: 1
            })
        }
    })

    return products;
})
const loanedItemsUI = computed(() => {
    let products:Array<{
        product: IProduct,
        loanId: number,
        quantity: number
    }> = [];

    loanedProductsItemsData.value.forEach((item) => {
        const product = products.find((product) => product.product.id === item.product_item?.product.id);

        if (product){
            product.quantity++;
        } else {
            products.push({
                loanId: item.id,
                product: productsData.value.find((product) => product.id === item.product_item?.product.id) as IProduct,
                quantity: 1
            })
        }
    })

    return products;
})
const receivedItemsUI = computed(() => {
    return dispachedItemsUI.value.concat(loanedItemsUI.value).map((item) => {
        const sent = item.quantity;
        const received = (() => {
            const prod = outcomeRequestData.value?.received_products.find((si) => si.product_id == item.product.id);
            if (prod){
                return prod.quantity;
            } else {
                return 0;
            }
        })();


        return {
            ...item,
            sent: sent,
            received: received,
            quantity: undefined,
            diff: sent - received,
            diffText: (() => {
                if (sent == received){
                    return 'Recibido';
                } else if (sent > received){
                    return 'Faltan ' + (sent - received) + ' por recibir';
                } else {
                    return (received - sent) + ' ítems además';
                }
            })()
        }
    })
})

const requestedByUser = computed(() => {
    return usersData.value.find((user) => user.id == outcomeRequestData.value?.user_id);
})


const timelineUI = computed(() => {
    if (viewModeAs.value == 'Dispacher'){
        return [
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Requested){
                    return {
                        title: 'Aprobar pedido',
                        description: 'El solicitante ha enviado un pedido. Revisa los productos y apruebálo o rechazálo.',
                        actions: [
                            {
                                text: 'Aprobar pedido',
                                fill: 'solid',
                                color: 'success',
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Approved),
                                icon: thumbsUpOutline
                            },
                            {
                                text: 'Rechazar pedido',
                                fill: 'outline',
                                color: 'danger',
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Rejected),
                                icon: thumbsDownOutline
                            }
                        ],
                        icon: null,
                        status: 'warning'
                    }
                }else if (
                    outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Approved
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                    ){
                    return {
                        title: 'Pedido aprobado',
                        description: 'Ud. ha aprobado el pedido.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Rejected){
                    return {
                        title: 'Pedido rechazado',
                        description: 'Ud. ha rechazado el pedido.',
                        actions: [
                        ],
                        icon: null,
                        status: 'canceled'
                    }
                }else{
                    return {
                        title: 'Aprobar pedido',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Approved){
                    return {
                        title: 'Separar productos',
                        description: 'Ud. debe separar los productos en el stock para enviarlos al solicitante.',
                        actions: [
                            {
                                text: 'Separar productos ahora',
                                fill: 'solid',
                                color: 'success',
                                handler: () => createDispatch(),
                                icon: sendOutline
                            }
                        ],
                        icon: null,
                        status: 'warning'
                    }
                }else if (
                        outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                    ){
                    return {
                        title: 'Productos separados',
                        description: 'Ud. ha separado los productos solicitados y ellos han sido dado de baja del stock.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Separar productos',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched){
                    return {
                        title: 'Enviar productos',
                        description: 'Envía los productos despachados al solicitante por un medio de transporte.',
                        actions: [
                            {
                                text: 'Enviar productos ahora',
                                fill: 'solid',
                                color: 'success',
                                icon: sendOutline,
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.OnTheWay)
                            }
                        ],
                        icon: null,
                        status: 'warning'
                    }
                }else if (
                    outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                ){
                    return {
                        title: 'Productos enviados',
                        description: 'Los productos salieron del almacén.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Enviar productos',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay){
                    return {
                        title: 'Entrega en camino',
                        description: 'Los productos están en camino hacia el solicitante.',
                        actions: [
                            {
                                text: 'Cancelar envío',
                                fill: 'solid',
                                color: 'danger',
                                icon: closeCircleOutline,
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Dispatched),
                            }
                        ],
                        icon: airplaneOutline,
                        status: 'in-progress'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                ){
                    return {
                        title: 'Productos entregados',
                        description: 'Los productos han sido entregados al solicitante.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Entrega en camino',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered){
                    return {
                        title: 'Revisando entrega',
                        description: 'El solicitante está chequeando si la entrega está conforme.',
                        actions: [],
                        icon: null,
                        status: 'in-progress'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                    return {
                        title: 'Productos revisados',
                        description: 'Los productos han sido entregados al solicitante de forma correcta.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Revisando entrega',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                    return {
                        title: 'Finalizado',
                        description: 'El pedido ha sido finalizado y los productos han sido entregados al solicitante.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Finalizado',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })()
        ];
    }else if (viewModeAs.value == 'Requester'){
        return [
        (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Draft){
                    return {
                        title: 'Envía tu pedido',
                        description: 'Ud. ha creado un pedido. Envíalo al almacén para su aprobación.',
                        actions: [
                            {
                                text: 'Cambiar productos',
                                fill: 'outline',
                                color: 'primary',
                                handler: () => {
                                    showEditOutcomeRequest()
                                },
                                icon: bagHandleOutline
                            },
                            {
                                text: 'Enviar pedido',
                                fill: 'solid',
                                color: 'success',
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Requested),
                                icon: sendOutline
                            }
                        ],
                        icon: null,
                        status: 'warning'
                    }
                }else if (
                    outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Requested
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Approved
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                    ){
                    return {
                        title: 'Pedido enviado',
                        description: 'Su pedido ha sido enviado al almacén.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Envío de pedido',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Requested){
                    return {
                        title: 'Esperando aprobación',
                        description: 'El almacén está revisando su pedido. Una vez aprobado, Ud. será notificado.',
                        actions: [
                            {
                                text: 'Modificar mi pedido',
                                fill: 'outline',
                                color: 'danger',
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Draft),
                                icon: pencilOutline
                            }
                        ],
                        icon: null,
                        status: 'in-progress'
                    }
                }else if (
                    outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Approved
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                    ){
                    return {
                        title: 'Pedido aprobado',
                        description: 'Su pedido ha sido aprobado por el almacén.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Rejected){
                    return {
                        title: 'Pedido rechazado',
                        description: 'Su pedido ha sido rechazado por el almacén.',
                        actions: [
                        ],
                        icon: null,
                        status: 'canceled'
                    }
                }else{
                    return {
                        title: 'Aprobación del pedido',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Approved){
                    return {
                        title: 'Separando productos',
                        description: 'El almacén está separando los productos solicitados para enviarlos.',
                        actions: [],
                        icon: null,
                        status: 'in-progress'
                    }
                }else if (
                        outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                    ){
                    return {
                        title: 'Productos separados',
                        description: 'Los productos han sido separados y están listos para ser enviados.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Separando productos',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched){
                    return {
                        title: 'Preparando para el envío',
                        description: 'Los productos están listos para ser enviados. El almacén los enviará pronto.',
                        actions: [],
                        icon: null,
                        status: 'in-progress'
                    }
                }else if (
                    outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                ){
                    return {
                        title: 'Productos enviados',
                        description: 'Los productos salieron del almacén.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Preparando para el envío',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay){
                    return {
                        title: 'Entrega en camino',
                        description: 'Los productos están en camino hacia tu dirección...',
                        actions: [
                            {
                                text: 'He recibido los productos',
                                fill: 'solid',
                                color: 'success',
                                icon: checkmarkCircleOutline,
                                handler: () => changeRequestStatus(EInventoryWarehouseOutcomeRequestStatus.Delivered),
                            }
                        ],
                        icon: airplaneOutline,
                        status: 'in-progress'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered
                    || outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished
                ){
                    return {
                        title: 'Productos entregados',
                        description: 'Ud. ha recibido los productos solicitados.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Entrega en camino',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Delivered){
                    return {
                        title: 'Revisar entrega',
                        description: 'El almacén está esperando que Ud. revise los productos recibidos.',
                        actions: [
                            {
                                text: 'Revisar productos recibidos ahora',
                                fill: 'solid',
                                color: 'success',
                                icon: sendOutline,
                                handler: () => openOutcomeRequestReceiptProductsSelector(),
                            }
                        ],
                        icon: null,
                        status: 'warning'
                    }
                }else if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                    return {
                        title: 'Productos revisados',
                        description: 'Los productos han sido entregados y Ud. ha confirmado la entrega.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Revisando entrega',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })(),
            (() => {
                if (outcomeRequestData.value?.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                    return {
                        title: 'Finalizado',
                        description: 'El pedido ha sido finalizado y los productos han sido entregados correctamente.',
                        actions: [],
                        icon: null,
                        status: 'completed'
                    }
                }else{
                    return {
                        title: 'Finalizado',
                        description: '',
                        actions: [],
                        icon: null,
                        status: 'pending'
                    };
                }
            })()
        ];
    }
})



const loadOutcomeRequest = async () => {
    if (isDeleted.value){
        return;
    }
    isLoading.value = true;
    isLoadingAreas.value.outcomeRequest = true;
    isLoadingAreas.value.products = true;
    isLoadingAreas.value.dispachedProducts = true;
    isLoadingAreas.value.loanedProducts = true;

    const response = await RequestAPI.get('/inventory/warehouse-outcome-requests/' + outcomeRequestId);

    outcomeRequestData.value = response;
    await loadProducts();

    if (outcomeRequestData.value?.inventory_warehouse_outcome_id){
        await loadDispachedProductsItems();
    }else{
        isLoadingAreas.value.dispachedProducts = false;
    }

    await loadLoanedProductsItems();

    isLoading.value = false;
    isLoadingAreas.value.outcomeRequest = false;
}
const loadProducts = async () => {
    isLoading.value = true;
    isLoadingAreas.value.products = true;
    const response = await RequestAPI.get('/inventory/warehouses/' + outcomeRequestData.value?.inventory_warehouse_id + '/stock');

    productsData.value = response;

    isLoading.value = false;
    isLoadingAreas.value.products = false;
}
const loadDispachedProductsItems = async () => {
    isLoading.value = true;
    isLoadingAreas.value.dispachedProducts = true;
    const response = await RequestAPI.get('/inventory/warehouse-outcomes/' + outcomeRequestData.value?.inventory_warehouse_outcome_id + '/products');

    dispachedProductsItemsData.value = response;
    isLoading.value = false;
    isLoadingAreas.value.dispachedProducts = false;
}
const loadLoanedProductsItems = async () => {
    isLoading.value = true;
    isLoadingAreas.value.loanedProducts = true;
    const response = await RequestAPI.get('/inventory/warehouse-outcome-requests/' + outcomeRequestData.value?.id + '/loans');

    loanedProductsItemsData.value = response;
    isLoading.value = false;
    isLoadingAreas.value.loanedProducts = false;
}

const changeRequestStatus = async (status: EInventoryWarehouseOutcomeRequestStatus) => {
    isLoading.value = true;
    isLoadingAreas.value.outcomeRequest = true;
    const response = await RequestAPI.put('/inventory/warehouse-outcome-requests/' + outcomeRequestId, {
        status: status
    });

    outcomeRequestData.value = response.warehouse_outcome_request;
    isLoading.value = false;
    isLoadingAreas.value.outcomeRequest = false;
    AppEvents.emit('inventory:reload');
}


const saveReceivedProducts = async (receivedProducts: IWarehouseOutcomeRequest['received_products'], status: EInventoryWarehouseOutcomeRequestStatus) => {
    isLoading.value = true;
    isLoadingAreas.value.outcomeRequest = true;
    const response = await RequestAPI.put('/inventory/warehouse-outcome-requests/' + outcomeRequestId, {
        received_products: receivedProducts,
        status: status
    });

    outcomeRequestData.value = response.warehouse_outcome_request;
    isLoading.value = false;
    isLoadingAreas.value.outcomeRequest = false;
    AppEvents.emit('inventory:reload');
}


const openOutcomeRequestReceiptProductsSelector  = async () => {
    Dialog.show(InventoryOutcomeRequestReceiptProductsSelector, {
        props: {
            products: dispachedItemsUI.value.map((item) => {
                return {
                    product: item.product,
                    sent: item.quantity,
                    received: item.quantity
                }
            }).concat(loanedItemsUI.value.map((item) => {
                return {
                    product: item.product as IProductWithWarehouseStock,
                    sent: 1,
                    received: 1
                }
            }))
        },
        onLoaded($this) {
            $this.on('received-all', (event:any) => {
                const products = event.data;

                outcomeRequestData.value.received_products = products.map((item:any) => {
                    return {
                        product_id: item.product.id,
                        quantity: item.quantity
                    }
                });


                saveReceivedProducts(outcomeRequestData.value.received_products, EInventoryWarehouseOutcomeRequestStatus.Finished);
            })
            $this.on('not-received-all', async (event:any) => {
                const products = event.data;
                outcomeRequestData.value.received_products = products.map((item:any) => {
                    return {
                        product_id: item.product.id,
                        quantity: item.quantity
                    }
                });

                await saveReceivedProducts(outcomeRequestData.value.received_products, EInventoryWarehouseOutcomeRequestStatus.Finished);
                openChat();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}
const openLoanProduct = async (loadId:number) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loanedProductsItemsData.value.find((item) => item.id === loadId)?.id,
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
} 
const createDispatch = async () => {
    Dialog.show(CreateInventoryWarehouseOutcome, {
        props: {
            warehouseId: outcomeRequestData.value?.inventory_warehouse_id,
            targets: {
                jobCode: outcomeRequestData.value?.job_code,
                expenseCode: outcomeRequestData.value?.expense_code,
                userId: outcomeRequestData.value?.user_id,
                products: outcomeRequestData.value?.requested_products.map((item) => {
                    return {
                        product: productsData.value.find((product) => product.id === item.product_id),
                        quantity: item.quantity
                    }
                }),
                outcomeRequestId: outcomeRequestId
            }
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}
const undoDispatch = async () => {
    //Create alertController dialog explaining the undo action:
    const alert = await alertController.create({
        header: 'Deshacer separación de productos',
        message: '¿Está seguro que desea deshacer la separación de los productos? Los productos volverán a estar disponibles en el almacén.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Deshacer separación',
                handler: async () => {
                    isLoading.value = true;
                    isLoadingAreas.value.outcomeRequest = true;
                    const response = await RequestAPI.put('/inventory/warehouse-outcome-requests/' + outcomeRequestId, {
                        status: EInventoryWarehouseOutcomeRequestStatus.Approved
                    });
                    outcomeRequestData.value = response.warehouse_outcome_request;
                    isLoading.value = false;
                    isLoadingAreas.value.outcomeRequest = false;
                    AppEvents.emit('inventory:reload');
                },
                role: 'destructive'
            }
        ]
    });

    alert.present();
}

const openWarehouseOutcome = async () => {
    isLoading.value = true;
    const outcomeRequest = await RequestAPI.get('/inventory/warehouse-outcomes/' + outcomeRequestData.value?.inventory_warehouse_outcome_id);

    Dialog.show(EditInventoryWarehouseOutcome, {
        props: {
            warehouseOutcome: outcomeRequest,
            isReadonly: true
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })

    isLoading.value = false;
}

const deleteOutcomeRequest = async () => {
    const alert = await alertController.create({
        header: 'Borrar pedido',
        message: '¿Está seguro que desea borrar el pedido? Esta acción no se puede deshacer.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Borrar pedido',
                handler: async () => {
                    isLoading.value = true;
                    isLoadingAreas.value.outcomeRequest = true;
                    const response = await RequestAPI.delete('/inventory/warehouse-outcome-requests/' + outcomeRequestData.value?.id);
                    isDeleted.value = true;
                    AppEvents.emit('inventory:reload');
                    router.replace('/inventory');
                },
                role: 'destructive'
            }
        ]
    });

    alert.present();
}

const openChat = async () => {
    router.push('/inventory/outcome-requests/' + outcomeRequestId + '/chat');
}

const showEditOutcomeRequest = () => {
    Dialog.show(EditInventoryWarehouseOutcomeRequest, {
        props: {
            outcomeRequestId: outcomeRequestId
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}


const downloadRequestedProductsPDF = async () => {
    const generatePDFDocument = async () => {
        return new Promise(async (resolve, reject) => {
            const pdfDownloadUrl = `${RequestAPI.variables.rootUrl}/inventory/warehouse-outcome-requests/${outcomeRequestId}/download-pdf`;

            const pdfDocument = await Toolbox.fetchWithProgress(pdfDownloadUrl,  {
                method: 'GET',
                headers: {
                    'Authorization': await RequestAPI.authHeader()
                }
            }, (progress) => {
            }).then((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        blobUrl: URL.createObjectURL(blob),
                        base64: reader.result?.split(';base64,')[1] as unknown as string
                    })
                }
                reader.onerror = () => {                
                    
                }
                reader.readAsDataURL(blob);
            }).catch((error) => {
            }).finally(() => {
            })
        });
    }
    const shareDocument = (file:any, extention:string = ".zip") => {
        toastController.create({
            message: '✅ Documento generado con éxito!',
            duration: 1500
        }).then((toast) => {
            toast.present();
        })
        if (Capacitor.isNativePlatform()){
            Toolbox.openNative('Solicitud de Productos N00' + outcomeRequestId+ extention, file.base64);
        }else{
            let link = document.createElement('a');
            link.href = file.blobUrl;
            link.download = 'Solicitud de Productos N00' + outcomeRequestId+ extention;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    isLoading.value = true;
    const pdfDocument = await generatePDFDocument();
    shareDocument(pdfDocument, '.pdf');
    isLoading.value = false;
}  

const currentDeviceTheme = computed(() => {
    return Theme.getTheme();
});

const loadFormData = async () => {
    await loadOutcomeRequest();
}

const loadUsers = async () => {
    usersData.value = await UsersStore.getUsers();
}

onMounted(() => {
    loadFormData();
    loadUsers();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadFormData();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })


    if (route.query['view-mode']){
        viewModeAs.value = route.query['view-mode'] as 'Requester'|'Dispacher';
    }
});
</script>

<style lang="scss" scoped>
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</style>