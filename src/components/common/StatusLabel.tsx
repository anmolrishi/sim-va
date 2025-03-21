import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

interface LabelProps {
  className?: string;
  color?:
    | 'primary'
    | 'black'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'success'
    | 'info'
    | 'bigsuccess'
    | 'bigerror';
  children?: ReactNode;
}

const LabelWrapper = styled('span')(
  ({ theme }) => `
    background-color: ${
      theme.palette.grey[100]
    };  // Default background if no color is selected
    padding: ${theme.spacing(0.5, 1)};
    font-size: ${theme.typography.pxToRem(13)};
    border-radius: ${theme.shape.borderRadius};  // Default rounded corners
    display: inline-flex;
    align-items: center;
    justify-content: center;
    max-height: ${theme.spacing(3)};
    font-weight: bold;

    // Add a custom curved effect
    border-radius: ${theme.spacing(
      2
    )};  // This gives a rounded curve effect from both sides

    &.MuiLabel {
      &-primary {
        background-color: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
      }

      &-black {
        background-color: ${theme.palette.common.black};
        color: ${theme.palette.common.white};
      }

      &-secondary {
        background-color: #F9F5FF;  // Custom background color
        color: #724CCA;  // Custom text color
      }

      &-success {
        background-color: #ECFDF3;  // Custom background color for success
        color: #3D9B73;  // Custom text color for success
      }

      &-bigsuccess {
        background-color: ${
          theme.palette.success.dark
        };  // Darker shade for more emphasis
        color: ${theme.palette.success.contrastText};
        padding: ${theme.spacing(1.5, 2)};
        font-size: ${theme.typography.pxToRem(15)};
      }

      &-warning {
        background-color: ${theme.palette.warning.main};
        color: ${theme.palette.warning.contrastText};
      }

      &-error {
        background-color: ${theme.palette.error.main};
        color: ${theme.palette.error.contrastText};
      }

      &-bigerror {
        background-color: ${
          theme.palette.error.dark
        };  // Darker shade for more emphasis
        color: ${theme.palette.error.contrastText};
        padding: ${theme.spacing(1.5, 2)};
        font-size: ${theme.typography.pxToRem(15)};
      }

      &-info {
        background-color: ${theme.palette.info.main};
        color: ${theme.palette.info.contrastText};
      }
    }
  `
);

const Label: FC<LabelProps> = ({
  className,
  color = 'secondary',
  children,
  ...rest
}) => {
  return (
    <LabelWrapper className={`MuiLabel-${color}`} {...rest}>
      {children}
    </LabelWrapper>
  );
};

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  color: PropTypes.oneOf([
    'primary',
    'black',
    'secondary',
    'error',
    'warning',
    'success',
    'info',
    'bigsuccess',
    'bigerror',
  ]),
};

export default Label;
