import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";

export type DeleteIconButtonProps = IconButtonProps;

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = (props) => {
  return (
    <IconButton
      size="xs"
      variant="plain"
      color={"icon.danger"}
      _hover={{ color: "icon.dangerHover" }}
      {...props}
    >
      <FiTrash2 />
    </IconButton>
  );
};
