/*
* == BSD2 LICENSE ==
* Copyright (c) 2014, Tidepool Project
*
* This program is free software; you can redistribute it and/or modify it under
* the terms of the associated License, which is identical to the BSD 2-Clause
* License as published by the Open Source Initiative at opensource.org.
*
* This program is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE. See the License for more details.
*
* You should have received a copy of the License along with this program; if
* not, you can obtain one from Tidepool Project at tidepool.org.
* == BSD2 LICENSE ==
*/
import Select from 'react-select';
import reactSelectStyles from '../constants/reactSelectStyles';
import CustomDropdownIndicator from './CustomDropdownIndicator';
import CustomOptionClinicSelect from './CustomOptionClinicSelect';
import CustomSingleValueClinicSelect from './CustomSingleValueClinicSelect';

var _ = require('lodash');
var React = require('react');
var PropTypes = require('prop-types');
var sundial = require('sundial');
var cx = require('classnames');
var personUtils = require('../../lib/core/personUtils');
var metrics = require('../constants/metrics');

var styles = require('../../styles/components/ClinicUserSelect.module.less');

class ClinicUserSelect extends React.Component {
  static propTypes = {
    allUsers: PropTypes.object.isRequired,
    onUserChange: PropTypes.func.isRequired,
    targetId: PropTypes.string,
    targetUsersForUpload: PropTypes.array.isRequired,
    onAddUserClick: PropTypes.func.isRequired,
    setTargetUser: PropTypes.func.isRequired
  };

  handleClickNext = (e) => {
    e.preventDefault();
    if(this.props.targetId){
      this.props.onUserChange(this.props.targetId);
    }
  };

  handleOnChange = (option) => {
    this.props.setTargetUser(option.value, {eventName: metrics.CLINIC_SEARCH_SELECTED});
  };

  renderSelector = () => {
    var allUsers = this.props.allUsers;
    var targets = this.props.targetUsersForUpload;
    var sorted = _.sortBy(targets, function(targetId) {
      return personUtils.patientFullName(allUsers[targetId]);
    });

    var selectorOpts = _.map(sorted, function(targetId) {
      var targetInfo = allUsers[targetId];
      var mrn = _.get(targetInfo, ['patient', 'mrn'], '');
      var bday = _.get(targetInfo, ['patient', 'birthday'], '');
      if(bday){
        bday = ' ' + sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY');
      }
      if (mrn) {
        mrn = ' ' + mrn;
      }
      var fullName = personUtils.patientFullName(targetInfo);
      return {value: targetId, label: fullName + mrn + bday};
    });

    return (
      <Select
        name={'uploadTargetSelect'}
        placeholder={'Search'}
        className={styles.Select}
        isClearable={false}
        value={selectorOpts.find(opt => opt.value === this.props.targetId)}
        options={selectorOpts}
        matchProp={'label'} //NOTE: we only want to match on the label!
        components={{
          Option: CustomOptionClinicSelect,
          SingleValue: CustomSingleValueClinicSelect,
          DropdownIndicator: CustomDropdownIndicator
        }}
        onChange={this.handleOnChange}
        allUsers={allUsers}
        styles={reactSelectStyles}
      />
    );
  };

  renderButton = () => {
    var classes = cx({
      [styles.button]: true,
      disabled: !this.props.targetId
    });
    return (
      <div className={classes} disabled={!this.props.targetId} onClick={this.handleClickNext}>
        Next
      </div>
    );
  };

  renderAddNew = () => {
    var classes = cx({
      [styles.addLink]: true
    });
    return (
      <div className={classes} onClick={this.props.onAddUserClick}>
        <i className={styles.addIcon}></i>
        Add new
      </div>
    );
  };

  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.wrapInner}>
          <div className={styles.headerWrap}>
            <div className={styles.header}>
              Who are you uploading for?
            </div>
            {this.renderAddNew()}
          </div>
          <div className={styles.clinicUserDropdown}>
            {this.renderSelector()}
          </div>
          <div className={styles.buttonRow}>
            {this.renderButton()}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ClinicUserSelect;
