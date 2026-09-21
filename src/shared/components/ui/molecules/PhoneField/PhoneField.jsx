import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./PhoneField.scss";

export default function PhoneField({
  id,
  value,
  onChange,
  invalid = false,
  className = "",
  ...rest
}) {
  const classes = ["phone-field", invalid && "phone-field--invalid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <PhoneInput
      id={id}
      className={classes}
      value={value}
      onChange={onChange}
      defaultCountry="ES"
      {...rest}
    />
  );
}