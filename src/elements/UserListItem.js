/** @jsx React.DOM */
var React = require('react');

var UserListItem = React.createClass({
  propTypes: {
    fullName: React.PropTypes.string.isRequired,
    href: React.PropTypes.string.isRequired,
    permissions: React.PropTypes.array.isRequired
  },

  render: function() {
    var permissions = this.props.permissions.join(', ');
    return (
      <li>
        <a href={this.props.href}>{this.props.fullName}</a>
        <span> ({permissions})</span>
      </li>
    );
  }
});

module.exports = UserListItem;
