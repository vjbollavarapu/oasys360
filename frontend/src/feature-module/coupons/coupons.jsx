import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  Calendar,
  ChevronUp,
  PlusCircle,
  RotateCcw,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { Box, Filter, Sliders, Zap } from "react-feather";
import Select from "react-select";
import { setToogleHeader } from "../../core/redux/action";
import AddCoupons from "../../core/modals/coupons/addcoupons";
import EditCoupons from "../../core/modals/coupons/editcoupons";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { DatePicker } from "antd";

const Coupons = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };
  const oldandlatestvalue = [
    { value: "date", label: "Sort by Date" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];
  const price = [
    { value: "choose", label: "Choose Type" },
    { value: "fixed", label: "Fixed" },
    { value: "percentage", label: "Percentage" },
  ];
  const pricelist = [
    { value: "Choose Name", label: "Choose Name" },
    { value: "Coupons 21", label: "Coupons 21" },
    { value: "First Offer", label: "First Offer" },
    { value: "Offer 40", label: "Offer 40" },
    { value: "Subscription", label: "Subscription" },
  ];

  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>
      Pdf
    </Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>
      Excel
    </Tooltip>
  );
  const renderPrinterTooltip = (props) => (
    <Tooltip id="printer-tooltip" {...props}>
      Printer
    </Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
  };
  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Coupons</h4>
                <h6>Manage Your Coupons</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
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
                    onClick={() => {
                      dispatch(setToogleHeader(!data));
                    }}
                  >
                    <ChevronUp />
                  </Link>
                </OverlayTrigger>
              </li>
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-units"
              >
                <PlusCircle className="me-2" />
                Add New Coupons
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search"
                      className="form-control form-control-sm formsearch"
                    />
                    <Link to className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <div className="d-flex align-items-center">
                    <Link
                      className={`btn btn-filter ${
                        isFilterVisible ? "setclose" : ""
                      }`}
                      id="filter_search"
                    >
                      <Filter
                        className="filter-icon"
                        onClick={toggleFilterVisibility}
                      />
                      <span onClick={toggleFilterVisibility}>
                        <ImageWithBasePath
                          src="assets/img/icons/closes.svg"
                          alt="img"
                        />
                      </span>
                    </Link>
                    <div className="layout-hide-box">
                      <Link to="#" className="me-3 layout-box">
                        <i data-feather="layout" className="feather-search" />
                      </Link>
                      <div className="layout-drop-item card">
                        <div className="drop-item-head">
                          <h5>Want to manage datatable?</h5>
                          <p>
                            Please drag and drop your column to reorder your
                            table and enable see option as you want.
                          </p>
                        </div>
                        <ul>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Shop
                              </span>
                              <input
                                type="checkbox"
                                id="option1"
                                className="check"
                                defaultChecked=""
                              />
                              <label
                                htmlFor="option1"
                                className="checktoggle"
                              />
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Product
                              </span>
                              <input
                                type="checkbox"
                                id="option2"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option2" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Reference No
                              </span>
                              <input
                                type="checkbox"
                                id="option3"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option3" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Date
                              </span>
                              <input
                                type="checkbox"
                                id="option4"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option4" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Responsible Person
                              </span>
                              <input
                                type="checkbox"
                                id="option5"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option5" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Notes
                              </span>
                              <input
                                type="checkbox"
                                id="option6"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option6" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Quantity
                              </span>
                              <input
                                type="checkbox"
                                id="option7"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option7" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                              <span className="status-label">
                                <i
                                  data-feather="menu"
                                  className="feather-menu"
                                />
                                Actions
                              </span>
                              <input
                                type="checkbox"
                                id="option8"
                                className="check"
                                defaultChecked=""
                              />
                              <label htmlFor="option8" className="checktoggle">
                                {" "}
                              </label>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-sort">
                  <Sliders className="info-img" />
                  <Select
                    className="img-select"
                    classNamePrefix="react-select"
                    options={oldandlatestvalue}
                    placeholder="Newest"
                  />
                </div>
              </div>
              {/* /Filter */}
              <div
                className={`card${isFilterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: isFilterVisible ? "block" : "none" }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Zap className="info-img" />

                        <Select
                          className="img-select"
                          classNamePrefix="react-select"
                          options={pricelist}
                          placeholder="Choose Type"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Box className="info-img" />
                        <Select
                          className="img-select"
                          classNamePrefix="react-select"
                          options={price}
                          placeholder="Choose Type"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Calendar className="info-img" />
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          type="date"
                          className="filterdatepicker"
                          dateFormat="dd-MM-yyyy"
                          placeholder="20-2-2024"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                      <div className="input-blocks">
                        <Link className="btn btn-filters ms-auto">
                          {" "}
                          <i
                            data-feather="search"
                            className="feather-search"
                          />{" "}
                          Search{" "}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Filter */}
              <div className="table-responsive">
                <table className="table  datanew">
                  <thead>
                    <tr>
                      <th className="no-sort">
                        <label className="checkboxs">
                          <input type="checkbox" id="select-all" />
                          <span className="checkmarks" />
                        </label>
                      </th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Discount</th>
                      <th>Limit</th>
                      <th>Used</th>
                      <th>Valid</th>
                      <th>Status</th>
                      <th className="no-sort">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>Coupons 21 </td>
                      <td>
                        <span className="badge badge-bgdanger">Christmas</span>
                      </td>
                      <td>Fixed</td>
                      <td>$20</td>
                      <td>04</td>
                      <td>01</td>
                      <td>04 Jan 2023</td>
                      <td>
                        <span className="badge badge-linesuccess">Active</span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                          >
                            <i data-feather="edit" className="feather-edit" />
                          </Link>
                          <Link
                            className="confirm-text p-2"
                            to="#"
                            onClick={showConfirmationAlert}
                          >
                            <i
                              data-feather="trash-2"
                              className="feather-trash-2"
                            />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>First Offer </td>
                      <td>
                        <span className="badge badge-bgdanger">
                          First Offer
                        </span>
                      </td>
                      <td>Percentage</td>
                      <td>10%</td>
                      <td>47</td>
                      <td>10</td>
                      <td>15 Feb 2023</td>
                      <td>
                        <span className="badge badge-linesuccess">Active</span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                          >
                            <i data-feather="edit" className="feather-edit" />
                          </Link>
                          <Link
                            className="confirm-text p-2"
                            to="#"
                            onClick={showConfirmationAlert}
                          >
                            <i
                              data-feather="trash-2"
                              className="feather-trash-2"
                            />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>Offer 40 </td>
                      <td>
                        <span className="badge badge-bgdanger">40% Offer</span>
                      </td>
                      <td>Fixed</td>
                      <td>$20</td>
                      <td>21</td>
                      <td>14</td>
                      <td>08 Apr 2023</td>
                      <td>
                        <span className="badge badge-linesuccess">Active</span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                          >
                            <i data-feather="edit" className="feather-edit" />
                          </Link>
                          <Link
                            className="confirm-text p-2"
                            to="#"
                            onClick={showConfirmationAlert}
                          >
                            <i
                              data-feather="trash-2"
                              className="feather-trash-2"
                            />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>Subscription </td>
                      <td>
                        <span className="badge badge-bgdanger">FirstSub01</span>
                      </td>
                      <td>Fixed</td>
                      <td>$20</td>
                      <td>09</td>
                      <td>07</td>
                      <td>12 Aug 2023</td>
                      <td>
                        <span className="badge badge-linesuccess">Active</span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                          >
                            <i data-feather="edit" className="feather-edit" />
                          </Link>
                          <Link className="confirm-text p-2" to="#">
                            <i
                              data-feather="trash-2"
                              className="feather-trash-2"
                            />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>
      <AddCoupons />
      <EditCoupons />
    </div>
  );
};

export default Coupons;
