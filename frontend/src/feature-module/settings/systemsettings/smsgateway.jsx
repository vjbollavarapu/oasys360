import { ChevronUp, Mail, RotateCcw, Settings } from 'feather-icons-react/build/IconComponents'
import React from 'react'
import { Link } from 'react-router-dom'
import NexmoConfig from '../../../core/modals/settings/nexmoconfig'
import TwilioConfig from '../../../core/modals/settings/twilioconfig'
import TwoFactorConfig from '../../../core/modals/settings/twofactorconfig'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { setToogleHeader } from '../../../core/redux/action'
import { useDispatch, useSelector } from 'react-redux'
import SettingsSideBar from '../settingssidebar'
import ImageWithBasePath from '../../../core/img/imagewithbasebath'

const SmsGateway = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);

    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Refresh
        </Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Collapse
        </Tooltip>
    )


    return (
        <div>
            <div className="page-wrapper">
                <div className="content settings-content">
                    <div className="page-header settings-pg-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Settings</h4>
                                <h6>Manage your settings on portal</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>

                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>

                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        id="collapse-header"
                                        className={data ? "active" : ""}
                                        onClick={() => { dispatch(setToogleHeader(!data)) }}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>

                        </ul>
                    </div>
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="settings-wrapper d-flex">
                            <SettingsSideBar/>
                                <div className="settings-page-wrap">
                                    <div className="setting-title">
                                        <h4>SMS Gateways</h4>
                                    </div>
                                    <div className="page-header text-end justify-content-end">
                                        <Link to="#" className="btn-added btn-primary">

                                            <Mail className="me-2" />
                                            Send test email
                                        </Link>
                                    </div>
                                    <div className="row">
                                        <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6 d-flex">
                                            <div className="connected-app-card d-flex w-100">
                                                <ul className="w-100 d-flex justify-content-between align-items-center">
                                                    <li className="gateway-icon mb-0">
                                                        <ImageWithBasePath src="assets/img/icons/sms-icon-01.svg" alt="" />
                                                    </li>
                                                    <li className="setting-gateway d-flex align-items-center">
                                                        <Link
                                                            to=""
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#nexmo-config"
                                                        >

                                                            <Settings className="me-2" />
                                                        </Link>
                                                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center ms-2">
                                                            <input
                                                                type="checkbox"
                                                                id="user1"
                                                                className="check"
                                                                defaultChecked="true"
                                                            />
                                                            <label htmlFor="user1" className="checktoggle">
                                                                {" "}
                                                            </label>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6 d-flex">
                                            <div className="connected-app-card d-flex w-100">
                                                <ul className="w-100 d-flex justify-content-between align-items-center">
                                                    <li className="gateway-icon mb-0">
                                                        <ImageWithBasePath src="assets/img/icons/sms-icon-02.svg" alt="" />
                                                    </li>
                                                    <li className="setting-gateway d-flex align-items-center">
                                                        <Link
                                                            to=""
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#factor-config"
                                                        >
                                                            <Settings className="me-2" />
                                                        </Link>
                                                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center ms-2">
                                                            <input
                                                                type="checkbox"
                                                                id="user2"
                                                                className="check"
                                                                defaultChecked="true"
                                                            />
                                                            <label htmlFor="user2" className="checktoggle">
                                                                {" "}
                                                            </label>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6 d-flex">
                                            <div className="connected-app-card d-flex w-100">
                                                <ul className="w-100 d-flex justify-content-between align-items-center">
                                                    <li className="gateway-icon mb-0">
                                                        <ImageWithBasePath src="assets/img/icons/sms-icon-03.svg" alt="" />
                                                    </li>
                                                    <li className="setting-gateway d-flex align-items-center">
                                                        <Link
                                                            to=""
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#twilio-config"
                                                        >
                                                            <Settings className="me-2" />
                                                        </Link>
                                                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center ms-2">
                                                            <input
                                                                type="checkbox"
                                                                id="user3"
                                                                className="check"
                                                                defaultChecked="true"
                                                            />
                                                            <label htmlFor="user3" className="checktoggle">
                                                                {" "}
                                                            </label>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NexmoConfig />
            <TwoFactorConfig />
            <TwilioConfig />
        </div>
    )
}

export default SmsGateway