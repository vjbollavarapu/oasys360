import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  Calendar,
  ChevronUp,
  FileText,
  PlusCircle,
  RotateCcw,
  Sliders,
  StopCircle,
  User,
} from "feather-icons-react/build/IconComponents";
import { setToogleHeader } from "../../core/redux/action";
import { useDispatch, useSelector } from "react-redux";
import { Filter, MinusCircle } from "react-feather";
import Select from "react-select";
import { DatePicker } from "antd";
import { saleslist } from "../../core/json/saleslistdata";
import Table from "../../core/pagination/datatable";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const SalesList = () => {
  const saleslistdata = saleslist;
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  const [searchText, setSearchText] = useState("");
  const filteredData = saleslistdata.filter((entry) => {
    return Object.keys(entry).some((key) => {
      return String(entry[key])
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
  });
  const oldandlatestvalue = [
    { value: "Sort by Date", label: "Sort by Date" },
    { value: "07 09 23", label: "07 09 23" },
    { value: "21 09 23", label: "21 09 23" },
  ];
  const customername = [
    { value: "Choose Customer Name", label: "Choose Customer Name" },
    { value: "Macbook pro", label: "Macbook pro" },
    { value: "Orange", label: "Orange" },
  ];
  const status = [
    { value: "Choose Status", label: "Choose Status" },
    { value: "Computers", label: "Computers" },
    { value: "Fruits", label: "Fruits" },
  ];
  const paymentstatus = [
    { value: "Choose Payment Status", label: "Choose Payment Status" },
    { value: "Computers", label: "Computers" },
    { value: "Fruits", label: "Fruits" },
  ];
  const customer = [
    { value: "Choose Customer", label: "Choose Customer" },
    { value: "Customer Name", label: "Customer Name" },
  ];
  const suppliername = [
    { value: "Supplier", label: "Supplier" },
    { value: "Supplier Name", label: "Supplier Name" },
  ];
  const statusupdate = [
    { value: "Supplier", label: "Choose" },
    { value: "Completed", label: "Completed" },
    { value: "InProgress", label: "InProgress" },
  ];
  const paymenttype = [
    { value: "Choose", label: "Choose" },
    { value: "Cash", label: "Cash" },
    { value: "Online", label: "Online" },
  ];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

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
  const columns = [
    {
      title: "CustomerName",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.length - b.customerName.length,
    },
    {
      title: "Reference",
      dataIndex: "reference",
      sorter: (a, b) => a.reference.length - b.reference.length,
    },

    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => a.date.length - b.date.length,
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span
          className={`badge ${
            text === "Completed" ? "badge-bgsuccess" : "badge-bgdanger"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a, b) => a.status.length - b.status.length,
    },
    {
      title: "GrandTotal",
      dataIndex: "grandTotal",
      sorter: (a, b) => a.grandTotal.length - b.grandTotal.length,
    },
    {
      title: "Paid",
      dataIndex: "paid",
      sorter: (a, b) => a.paid.length - b.paid.length,
    },
    {
      title: "Due",
      dataIndex: "due",
      sorter: (a, b) => a.due.length - b.due.length,
    },
    {
      title: "PaymentStatus",
      dataIndex: "paymentStatus",
      render: (text) => (
        <span
          className={`badge ${
            text === "Paid" ? "badge-linesuccess" : "badge-linedanger"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a, b) => a.paymentStatus.length - b.paymentStatus.length,
    },
    {
      title: "Biller",
      dataIndex: "biller",
      sorter: (a, b) => a.biller.length - b.biller.length,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: () => (
        <div className="text-center">
        <Link className="action-set" to="#" data-bs-toggle="dropdown" aria-expanded="true">
          <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
       </Link>
        <ul className="dropdown-menu">
          <li>
            <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#sales-details-new"><i data-feather="eye" className="feather-eye me-2"></i>Sale Detail</Link>
          </li>
          <li>
            <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#edit-sales-new"><i data-feather="edit" className="feather-edit me-2"></i>Edit Sale</Link>
          </li>
          <li>
            <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#showpayment"><i data-feather="dollar-sign" className="feather-dollar-sign"></i>Show Payments</Link>
          </li>
          <li>
            <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#createpayment"><i data-feather="plus-circle" className="feather-plus-circle me-2"></i>Create Payment</Link>
          </li>
          <li>
            <Link to="#" className="dropdown-item"><i data-feather="download" className="feather-edit me-2"></i>Download pdf</Link>
          </li>	
          <li>
            <Link to="#" className="dropdown-item confirm-text mb-0" onClick={showConfirmationAlert}><i data-feather="trash-2" className="feather-trash me-2"  ></i>Delete Sale</Link>
          </li>								
        </ul>
      </div>
      ),
    },
  ];
  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Sales List</h4>
                <h6>Manage Your Sales</h6>
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
                data-bs-target="#add-sales-new"
              >
                <PlusCircle className="me-2" />
                Add New Sales
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
                      aria-controls="DataTables_Table_0"
                      value={searchText}
                      onChange={handleSearch}
                    />
                    <Link to className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <div className="d-flex align-items-center">
                    <div className="search-path">
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
                        <i data-feather="user" className="info-img" />
                        <User className="info-img" />
                        <Select
                          className="img-select"
                          classNamePrefix="react-select"
                          options={customername}
                          placeholder="Newest"
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <StopCircle className="info-img" />
                        <Select
                          className="img-select"
                          classNamePrefix="react-select"
                          options={status}
                          placeholder="Newest"
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <FileText className="info-img" />
                        <input
                          type="text"
                          placeholder="Enter Reference"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <StopCircle className="info-img" />
                        <Select
                          className="img-select"
                          classNamePrefix="react-select"
                          options={paymentstatus}
                          placeholder="Choose Payment Status"
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
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
                <Table columns={columns} dataSource={filteredData} />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>
      <>
        {/*add popup */}
        <div className="modal fade" id="add-sales-new">
          <div className="modal-dialog add-centered">
            <div className="modal-content">
              <div className="page-wrapper p-0 m-0">
                <div className="content p-0">
                  <div className="modal-header border-0 custom-modal-header">
                    <div className="page-title">
                      <h4> Add Sales</h4>
                    </div>
                    <button
                      type="button"
                      className="close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Customer Name</label>
                              <div className="row">
                                <div className="col-lg-10 col-sm-10 col-10">
                                  <Select
                                    classNamePrefix="react-select"
                                    options={customer}
                                    placeholder="Newest"
                                  />
                                </div>
                                <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                  <div className="add-icon">
                                    <Link to="#" className="choose-add">
                                      <PlusCircle className="plus" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Date</label>
                              <div className="input-groupicon calender-input">
                              <Calendar className="info-img" />
                                <DatePicker
                                  selected={selectedDate}
                                  onChange={handleDateChange}
                                  type="date"
                                  className="filterdatepicker"
                                  dateFormat="dd-MM-yyyy"
                                  placeholder="Choose Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Supplier</label>
                              <Select
                                classNamePrefix="react-select"
                                options={suppliername}
                                placeholder="Newest"
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Product Name</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  placeholder="Please type product code and select"
                                />
                                <div className="addonset">
                                  <ImageWithBasePath
                                    src="assets/img/icons/qrcode-scan.svg"
                                    alt="img"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive no-pagination">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Purchase Price($)</th>
                                <th>Discount($)</th>
                                <th>Tax(%)</th>
                                <th>Tax Amount($)</th>
                                <th>Unit Cost($)</th>
                                <th>Total Cost(%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td />
                                <td />
                                <td />
                                <td />
                                <td />
                                <td />
                                <td />
                                <td />
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 ms-auto">
                            <div className="total-order w-100 max-widthauto m-auto mb-4">
                              <ul>
                                <li>
                                  <h4>Order Tax</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Discount</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Shipping</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Grand Total</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Order Tax</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  defaultValue={0}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Discount</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  defaultValue={0}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Shipping</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  defaultValue={0}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks mb-5">
                              <label>Status</label>
                              <Select
                                classNamePrefix="react-select"
                                options={statusupdate}
                                placeholder="status"
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 text-end">
                            <button
                              type="button"
                              className="btn btn-cancel add-cancel me-3"
                              data-bs-dismiss="modal"
                            >
                              Cancel
                            </button>
                            <Link to="#" className="btn btn-submit add-sale">
                              Submit
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /add popup */}
        {/* details popup */}
        <div className="modal fade" id="sales-details-new">
          <div className="modal-dialog sales-details-modal">
            <div className="modal-content">
              <div className="page-wrapper details-blk">
                <div className="content p-0">
                  <div className="page-header p-4 mb-0">
                    <div className="add-item d-flex">
                      <div className="page-title modal-datail">
                        <h4>Sales Detail : SL0101</h4>
                      </div>
                      <div className="page-btn">
                        <Link
                          to="#"
                          className="btn btn-added"
                          data-bs-dismiss="modal"
                        >
                          <PlusCircle className="me-2" />
                          Add New Sales
                        </Link>
                      </div>
                    </div>
                    <ul className="table-top-head">
                      <li>
                        <Link
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Pdf"
                        >
                          <i
                            data-feather="edit"
                            className="feather-edit sales-action"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Pdf"
                        >
                          <ImageWithBasePath
                            src="assets/img/icons/pdf.svg"
                            alt="img"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Excel"
                        >
                          <ImageWithBasePath
                            src="assets/img/icons/excel.svg"
                            alt="img"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Print"
                        >
                          <i
                            data-feather="printer"
                            className="feather-rotate-ccw"
                          />
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div
                          className="invoice-box table-height"
                         
                        >
                          <div className="sales-details-items d-flex">
                            <div className="details-item">
                              <h6>Customer Info</h6>
                              <p>
                                walk-in-customer
                                <br />
                                walk-in-customer@example.com
                                <br />
                                123456780
                                <br />
                                N45 , Dhaka
                              </p>
                            </div>
                            <div className="details-item">
                              <h6>Company Info</h6>
                              <p>
                                DGT
                                <br />
                                admin@example.com
                                <br />
                                6315996770
                                <br />
                                3618 Abia Martin Drive
                              </p>
                            </div>
                            <div className="details-item">
                              <h6>Invoice Info</h6>
                              <p>
                                Reference
                                <br />
                                Payment Status
                                <br />
                                Status
                              </p>
                            </div>
                            <div className="details-item">
                              <h5>
                                <span>SL0101</span>Paid
                                <br /> Completed
                              </h5>
                            </div>
                          </div>
                          <h5 className="order-text">Order Summary</h5>
                          <div className="table-responsive no-pagination">
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Qty</th>
                                  <th>Purchase Price($)</th>
                                  <th>Discount($)</th>
                                  <th>Tax(%)</th>
                                  <th>Tax Amount($)</th>
                                  <th>Unit Cost($)</th>
                                  <th>Total Cost(%)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <div className="productimgname">
                                      <Link
                                        to="#"
                                        className="product-img stock-img"
                                      >
                                        <ImageWithBasePath
                                          src="assets/img/products/stock-img-02.png"
                                          alt="product"
                                        />
                                      </Link>
                                      <Link to="#">Nike Jordan</Link>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="product-quantity">
                                      <span className="quantity-btn">
                                        +
                                        <PlusCircle/>
                                      </span>
                                      <input
                                        type="text"
                                        className="quntity-input"
                                        defaultValue={2}
                                      />
                                      <span className="quantity-btn">
                                        {/* <i
                                          data-feather="minus-circle"
                                          className="feather-minus-circle"
                                        /> */}
                                        <MinusCircle/>
                                      </span>
                                    </div>
                                  </td>
                                  <td>2000</td>
                                  <td>500</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>1500</td>
                                </tr>
                                <tr>
                                  <td>
                                    <div className="productimgname">
                                      <Link
                                        to="#"
                                        className="product-img stock-img"
                                      >
                                        <ImageWithBasePath
                                          src="assets/img/products/stock-img-03.png"
                                          alt="product"
                                        />
                                      </Link>
                                      <Link to="#">Apple Series 5 Watch</Link>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="product-quantity">
                                      <span className="quantity-btn">
                                        +
                                        <PlusCircle/>
                                      </span>
                                      <input
                                        type="text"
                                        className="quntity-input"
                                        defaultValue={2}
                                      />
                                      <span className="quantity-btn">
                                      <MinusCircle/>
                                      </span>
                                    </div>
                                  </td>
                                  <td>3000</td>
                                  <td>400</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>1700</td>
                                </tr>
                                <tr>
                                  <td>
                                    <div className="productimgname">
                                      <Link
                                        to="#"
                                        className="product-img stock-img"
                                      >
                                        <ImageWithBasePath
                                          src="assets/img/products/stock-img-05.png"
                                          alt="product"
                                        />
                                      </Link>
                                      <Link to="#">Lobar Handy</Link>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="product-quantity">
                                      <span className="quantity-btn">
                                        +
                                        <PlusCircle/>
                                      </span>
                                      <input
                                        type="text"
                                        className="quntity-input"
                                        defaultValue={2}
                                      />
                                      <span className="quantity-btn">
                                      <MinusCircle/>
                                      </span>
                                    </div>
                                  </td>
                                  <td>2500</td>
                                  <td>500</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>0.00</td>
                                  <td>2000</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="row">
                          <div className="row">
                            <div className="col-lg-6 ms-auto">
                              <div className="total-order w-100 max-widthauto m-auto mb-4">
                                <ul>
                                  <li>
                                    <h4>Order Tax</h4>
                                    <h5>$ 0.00</h5>
                                  </li>
                                  <li>
                                    <h4>Discount</h4>
                                    <h5>$ 0.00</h5>
                                  </li>
                                  <li>
                                    <h4>Grand Total</h4>
                                    <h5>$ 5200.00</h5>
                                  </li>
                                  <li>
                                    <h4>Paid</h4>
                                    <h5>$ 5200.00</h5>
                                  </li>
                                  <li>
                                    <h4>Due</h4>
                                    <h5>$ 0.00</h5>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /details popup */}
        {/* edit popup */}
        <div className="modal fade" id="edit-sales-new">
          <div className="modal-dialog edit-sales-modal">
            <div className="modal-content">
              <div className="page-wrapper p-0 m-0">
                <div className="content p-0">
                  <div className="page-header p-4 mb-0">
                    <div className="add-item new-sale-items d-flex">
                      <div className="page-title">
                        <h4>Edit Sales</h4>
                      </div>
                      <button
                        type="button"
                        className="close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Customer</label>
                              <div className="row">
                                <div className="col-lg-10 col-sm-10 col-10">
                                  <Select
                                    classNamePrefix="react-select"
                                    options={customer}
                                    placeholder="Newest"
                                  />
                                </div>
                                <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                  <div className="add-icon">
                                    <Link to="#" className="choose-add">
                                      <PlusCircle className="plus" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Purchase Date</label>
                              <div className="input-groupicon calender-input">
                              <Calendar className="info-img" />
                                <DatePicker
                                  selected={selectedDate}
                                  onChange={handleDateChange}
                                  type="date"
                                  className="filterdatepicker"
                                  dateFormat="dd-MM-yyyy"
                                  placeholder="Choose Date"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Supplier</label>
                              <Select
                                classNamePrefix="react-select"
                                options={suppliername}
                                placeholder="Newest"
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Product Name</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  placeholder="Please type product code and select"
                                />
                                <div className="addonset">
                                  <ImageWithBasePath
                                    src="assets/img/icons/scanners.svg"
                                    alt="img"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive no-pagination">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Purchase Price($)</th>
                                <th>Discount($)</th>
                                <th>Tax(%)</th>
                                <th>Tax Amount($)</th>
                                <th>Unit Cost($)</th>
                                <th>Total Cost(%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/products/stock-img-02.png"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Nike Jordan</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <PlusCircle/>
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                    <MinusCircle/>
                                    </span>
                                  </div>
                                </td>
                                <td>2000</td>
                                <td>500</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>1500</td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/products/stock-img-03.png"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Apple Series 5 Watch</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <PlusCircle/>
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                    <MinusCircle/>
                                    </span>
                                  </div>
                                </td>
                                <td>3000</td>
                                <td>400</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>1700</td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <ImageWithBasePath
                                        src="assets/img/products/stock-img-05.png"
                                        alt="product"
                                      />
                                    </Link>
                                    <Link to="#">Lobar Handy</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <PlusCircle/>
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                    <MinusCircle/>
                                    </span>
                                  </div>
                                </td>
                                <td>2500</td>
                                <td>500</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>2000</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 ms-auto">
                            <div className="total-order w-100 max-widthauto m-auto mb-4">
                              <ul>
                                <li>
                                  <h4>Order Tax</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Discount</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Shipping</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Grand Total</h4>
                                  <h5>$5200.00</h5>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Order Tax</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={0} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Discount</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={0} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Shipping</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={0} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks mb-5">
                              <label>Status</label>
                              <Select
                                classNamePrefix="react-select"
                                options={statusupdate}
                                placeholder="Newest"
                              />
                            </div>
                          </div>
                          <div className="col-lg-12">
                            <div className="input-blocks">
                              <label>Notes</label>
                              <textarea
                                className="form-control"
                                defaultValue={""}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 text-end">
                            <button
                              type="button"
                              className="btn btn-cancel add-cancel me-3"
                              data-bs-dismiss="modal"
                            >
                              Cancel
                            </button>
                            <Link to="#" className="btn btn-submit add-sale">
                              Submit
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /edit popup */}
        {/* show payment Modal */}
        <div
          className="modal fade"
          id="showpayment"
          tabIndex={-1}
          aria-labelledby="showpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header border-0 custom-modal-header">
                    <div className="page-title">
                      <h4>Show Payments</h4>
                    </div>
                    <button
                      type="button"
                      className="close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body custom-modal-body">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="modal-body-table total-orders">
                          <div className="table-responsive">
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Reference</th>
                                  <th>Amount</th>
                                  <th>Paid By</th>
                                  <th className="no-sort">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>19 Jan 2023</td>
                                  <td>INV/SL0101</td>
                                  <td>$1500</td>
                                  <td>Cash</td>
                                  <td className="action-table-data">
                                    <div className="edit-delete-action">
                                      <Link className="me-3 p-2" to="#">
                                        <i
                                          data-feather="printer"
                                          className="feather-rotate-ccw"
                                        />
                                      </Link>
                                      <Link
                                        className="me-3 p-2"
                                        to="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editpayment"
                                      >
                                        <i
                                          data-feather="edit"
                                          className="feather-edit"
                                        />
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* show payment Modal */}
        {/* Create payment Modal */}
        <div
          className="modal fade"
          id="createpayment"
          tabIndex={-1}
          aria-labelledby="createpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Create Payments</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label> Date</label>
                        <div className="input-groupicon calender-input ">
                        <Calendar className="info-img" />
                          <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            type="date"
                            className="filterdatepicker"
                            dateFormat="dd-MM-yyyy"
                            placeholder="Choose Date"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Reference</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Received Amount</label>
                        <div className="input-groupicon calender-input">
                          <i data-feather="dollar-sign" className="info-img" />
                          <input type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Paying Amount</label>
                        <div className="input-groupicon calender-input">
                          <i data-feather="dollar-sign" className="info-img" />
                          <input type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Payment type</label>
                        <Select
                          classNamePrefix="react-select"
                          options={paymenttype}
                          placeholder="Newest"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks">
                        <label>Description</label>
                        <textarea className="form-control" defaultValue={""} />
                        <p>Maximum 60 Characters</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <Link to="#" className="btn btn-submit">
                        Submit
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Create payment Modal */}
        {/* edit payment Modal */}
        <div
          className="modal fade"
          id="editpayment"
          tabIndex={-1}
          aria-labelledby="editpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Edit Payments</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>19 Jan 2023</label>
                        <div className="input-groupicon calender-input">
                          <Calendar className="info-img" />
                          <input
                            type="text"
                            className="datetimepicker form-control"
                            placeholder="Select Date"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Reference</label>
                        <input type="text" defaultValue="INV/SL0101" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Received Amount</label>
                        <div className="input-groupicon calender-input">
                          <i data-feather="dollar-sign" className="info-img" />
                          <input type="text" defaultValue={1500} />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Paying Amount</label>
                        <div className="input-groupicon calender-input">
                          <i data-feather="dollar-sign" className="info-img" />
                          <input type="text" defaultValue={1500} />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Payment type</label>
                        <select className="react-select">
                          <option>Cash</option>
                          <option>Online</option>
                          <option>Inprogress</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks summer-description-box transfer">
                        <label>Description</label>
                        <textarea className="form-control" defaultValue={""} />
                      </div>
                      <p>Maximum 60 Characters</p>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="modal-footer-btn mb-3 me-3">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* edit payment Modal */}
        <div className="customizer-links" id="setdata">
          <ul className="sticky-sidebar">
            <li className="sidebar-icons">
              <Link
                to="#"
                className="navigation-add"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                data-bs-original-title="Theme"
              >
                <i data-feather="settings" className="feather-five" />
              </Link>
            </li>
          </ul>
        </div>
      </>
    </div>
  );
};

export default SalesList;
